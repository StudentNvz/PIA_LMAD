document.addEventListener('DOMContentLoaded', async () => {
    
    const checkbox = document.getElementById("toggleTheme");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (checkbox) checkbox.checked = true;
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtrarYOrdenarPublicaciones();
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', filtrarYOrdenarPublicaciones);
    }

    const filterButtonsContainer = document.querySelector('.filter-buttons');
    if (filterButtonsContainer) {
        filterButtonsContainer.innerHTML = '<button class="filter-btn active" data-filter="all">Todos</button>';

        try {
            const response = await fetch('Public/php/api_mundiales.php');
            const result = await response.json();
            if (result.status === 'success') {
                result.data.forEach(mundial => {
                    const btn = document.createElement('button');
                    btn.className = 'filter-btn';
                    btn.setAttribute('data-filter', mundial.id); 
                    btn.textContent = `${mundial.year} ${mundial.country}`;
                    filterButtonsContainer.appendChild(btn);
                });

                filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        filtrarYOrdenarPublicaciones();
                    });
                });
            }
        } catch (error) {
            filterButtonsContainer.innerHTML += '<span style="color:red;">Error cargando mundiales</span>';
        }
    }

    await cargarPublicacionesAprobadas();
    await cargarDatos();
});

let publiGlobal = [];

async function cargarPublicacionesAprobadas() {
    const container = document.querySelector('.mostrar-publicaciones');
    
    if (!container) {
        console.error('Container .mostrar-publicaciones no encontrado');
        return;
    }
    container.innerHTML = '<div class="loading">Cargando publicaciones...</div>';
    
    try {  
        const testResponse = await fetch('Public/php/api_publi_new.php?endpoint=test');
        
        if (!testResponse.ok) {
            const testText = await testResponse.text();
            console.error('Test falló:', testText.substring(0, 500));
            throw new Error(`Test endpoint falló - HTTP ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log('Test exitoso:', testData);
        
        const response = await fetch('Public/php/api_publi_new.php?endpoint=todas&limite=20');
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText.substring(0, 1000));
            
            if (errorText.includes('<b>Fatal error</b>') || errorText.includes('Parse error')) {
                const errorMatch = errorText.match(/<b>(.*?)<\/b>:(.*?)in <b>(.*?)<\/b>/);
                if (errorMatch) {
                    throw new Error(`PHP Error: ${errorMatch[1]} - ${errorMatch[2].trim()} en ${errorMatch[3]}`);
                }
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response length:', text.length);
        
        if (!text || text.trim().length === 0) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('Texto que falló:', text.substring(0, 500));
            throw new Error('Respuesta no es JSON válido');
        }
        
        console.log('Datos recibidos:', data);

        if (data.status === 'success') {
            publiGlobal = data.data;
            filtrarYOrdenarPublicaciones();
        } else {
            throw new Error(data.message || 'Error desconocido en la API');
        }
        
    } catch (error) {
        console.error('Error completo:', error);
        container.innerHTML = `
            <div class="error-posts">
                <h3>Error al cargar publicaciones</h3>
                <p><strong>Detalles:</strong> ${error.message}</p>
                
                <div style="margin-top: 15px;">
                    <button class="btn-primary" onclick="cargarPublicacionesAprobadas()" style="margin: 5px;">
                        Reintentar
                    </button>
                    <button onclick="testAPIDirecto()" style="margin: 5px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px;">
                        Test API
                    </button>
                </div>
                
                <details style="margin-top: 10px; font-size: 12px;">
                    <summary>Información técnica</summary>
                    <p><strong>API:</strong> Public/php/api_publi_new.php</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
                </details>
            </div>
        `;
    }
}

function mostrarPublicacionesAprobadas(publicaciones, container) {

    container.innerHTML = `
        <div class="posts-header">
            <h2><strong>Publicaciones</strong></h2>
        </div>
    `;
    
    const postsGrid = document.createElement('div');
    postsGrid.className = 'posts-grid';
    
    const usuarioActual = obtenerUsuarioActual();
    console.log('Usuario actual:', usuarioActual);
    
    publicaciones.forEach((pub, index) => {
        console.log(`Publi ${index + 1}:`, pub);

        const div = document.createElement('div');
        div.className = 'post-card';
        div.setAttribute('data-id', pub.id_publicacion);
        
        const fecha = formatearFecha(pub.fechahora_publicacion);
        
        const tieneUsuario = usuarioActual && (usuarioActual.correo || usuarioActual.email);
        
        const imagenSrc = obtenerImagenPublicacion(pub);
        
        div.innerHTML = `
            <div class="post-card-image" onclick="abrirModalPublicacion(${pub.id_publicacion})">
                <img src="${imagenSrc}" 
                     alt="Imagen de ${pub.titulo}" 
                     class="post-img" 
                     loading="lazy"
                     onerror="this.src='Imagenes/default-post.jpg'">
            </div>
            <div class="post-card-content" onclick="abrirModalPublicacion(${pub.id_publicacion})">
                <h3>${pub.titulo || 'Sin título'}</h3>
                <p class="post-content">${pub.contenido || 'Sin contenido'}</p>
            </div>
            
            <div class="post-actions">
                <button class="action-btn favorite-btn ${tieneUsuario ? '' : 'disabled'}" 
                        onclick="${tieneUsuario ? `toggleFavorito(${pub.id_publicacion})` : 'mostrarLoginRequerido()'}" 
                        title="Agregar a favoritos">
                    <i class="fas fa-star"></i>
                </button>
                
                <button class="action-btn like-btn ${tieneUsuario ? '' : 'disabled'}" 
                        onclick="${tieneUsuario ? `toggleLike(${pub.id_publicacion})` : 'mostrarLoginRequerido()'}" 
                        title="Me gusta">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="count">${pub.likes || 0}</span>
                </button>
                
                <button class="action-btn comment-btn ${tieneUsuario ? '' : 'disabled'}" 
        onclick="${tieneUsuario ? `abrirModalPublicacion(${pub.id_publicacion})` : 'mostrarLoginRequerido()'}" 
        title="Comentarios">
    <i class="fas fa-comments"></i>
    <span class="count">${pub.comentarios || 0}</span>
</button>
                
                <span class="post-date" title="Fecha de publicación">
                    <i class="fas fa-calendar-alt"></i>
                    ${fecha}
                </span>
            </div>
        `;
        
        div.style.cursor = 'pointer'; 
        postsGrid.appendChild(div);
    });
    
    container.appendChild(postsGrid);
    
    if (usuarioActual && (usuarioActual.correo || usuarioActual.email)) {
        cargarEstadosUsuario(usuarioActual.correo || usuarioActual.email);
    }
}

function obtenerImagenPublicacion(publicacion) {
    console.log('Procesando publi:', {
        id: publicacion.id_publicacion,
        tiene_imagen_blob: publicacion.tiene_imagen_blob,
        media_info: publicacion.media_info,
        media_size: publicacion.media_size,
        imagen_blob_url: publicacion.imagen_blob_url
    });
    
    if (publicacion.tiene_imagen_blob && publicacion.imagen_blob_url) {
        console.log('Usando imagen BLOB:', publicacion.imagen_blob_url);
        return publicacion.imagen_blob_url;
    }
    
    const imagenBD = publicacion.media || publicacion.imagen || publicacion.photo;
    
    if (!imagenBD || imagenBD.trim() === '' || imagenBD === 'null' || imagenBD === null) {
        console.log('No hay imagen, usando default');
        return 'Imagenes/Logo1.png';
    }

    if (imagenBD.startsWith('http://') || imagenBD.startsWith('https://')) {
        console.log('Imagen es URL:', imagenBD);
        return imagenBD;
    }
    

    if (imagenBD.startsWith('Public/') || imagenBD.startsWith('uploads/')) {
        console.log('Imagen es ruta relativa:', imagenBD);
        return imagenBD;
    }
    
    if (imagenBD && !imagenBD.includes('/')) {
        console.log('Solo nombre de archivo, agregando ruta uploads/');
        return `uploads/${imagenBD}`;
    }
    
    console.log('Usando imagen tal como viene:', imagenBD);
    return imagenBD;
}


function obtenerUsuarioActual() {
    try {
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
            return Auth.getUser();
        }
        
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        if (isLoggedIn && userEmail) {
            return {
                correo: userEmail,
                email: userEmail,
                nombre_completo: userName,
                name: userName
            };
        }
        
        console.log('No hay usuario autenticado');
        return null;
        
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    
    try {
        const date = new Date(fecha);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const año = date.getFullYear();
        
        return `${dia}/${mes}/${año}`;
    } catch (error) {
        return 'Fecha inválida';
    }
}

async function cargarEstadosUsuario(correoUsuario) {
    try {
        console.log('Cargando:', correoUsuario);
        
        try {
            const likesResponse = await fetch(`Public/php/api_likes.php?action=getUserLikes&correo=${encodeURIComponent(correoUsuario)}`);
            if (likesResponse.ok) {
                const likesData = await likesResponse.json();
                
                if (likesData.status === 'success' && likesData.data) {
                    likesData.data.forEach(like => {
                        const likeBtn = document.querySelector(`[data-id="${like.id_publicacion}"] .like-btn`);
                        if (likeBtn) {
                            likeBtn.classList.add('active');
                        }
                    });
                }
            }
        } catch (error) {
            console.log('API de likes no disponible:', error.message);
        }
        
        try {
            const favResponse = await fetch(`Public/php/api_favoritos.php?action=getUserFavorites&correo=${encodeURIComponent(correoUsuario)}`);
            if (favResponse.ok) {
                const favData = await favResponse.json();
                
                if (favData.status === 'success' && favData.data) {
                    favData.data.forEach(fav => {
                        const favBtn = document.querySelector(`[data-id="${fav.id_publicacion}"] .favorite-btn`);
                        if (favBtn) {
                            favBtn.classList.add('active');
                        }
                    });
                }
            }
        } catch (error) {
            console.log('API de favoritos no disponible:', error.message);
        }
        
    } catch (error) {
        console.error('Error cargando estados del usuario:', error);
    }
}

async function toggleFavorito(idPublicacion) {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        mostrarLoginRequerido();
        return;
    }
    
    const favBtn = document.querySelector(`[data-id="${idPublicacion}"] .favorite-btn`);
    const favIcon = favBtn.querySelector('i');
    const isActive = favBtn.classList.contains('active');
    
    favBtn.style.pointerEvents = 'none'; 
    const originalHTML = favBtn.innerHTML;
    
    favBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        console.log('Enviando favorito:', {
            action: isActive ? 'remove' : 'add',
            correo: usuarioActual.correo || usuarioActual.email,
            id_publicacion: idPublicacion
        });
        
        const response = await fetch('Public/php/api_favoritos.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: isActive ? 'remove' : 'add',
                correo: usuarioActual.correo || usuarioActual.email,
                id_publicacion: idPublicacion
            })
        });
    
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('El archivo api_favoritos.php no se encuentra o hay un error de servidor. Verifica que existe en Public/php/');
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('La respuesta del servidor no es JSON válido. Verifica el archivo api_favoritos.php');
        }
        
        if (data.status === 'success') {
           
           favBtn.innerHTML = originalHTML;
            const newFavIcon = favBtn.querySelector('i');
            favBtn.classList.toggle('active');
            if (favBtn.classList.contains('active')) {
                newFavIcon.style.color = '#FFD700';
                favBtn.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                favBtn.style.border = '1px solid #FFD700';
                favBtn.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    favBtn.style.transform = 'scale(1)';
                }, 200);
                  
            } else {
    
                newFavIcon.style.color = '';
                favBtn.style.backgroundColor = '';
                favBtn.style.border = '';
            }       
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
        
    } catch (error) {        
        favBtn.innerHTML = originalHTML;
        
        if (error.message.includes('api_favoritos.php no se encuentra')) {
            alert('Función de favoritos no disponible\n\nEl archivo api_favoritos.php no existe.\nContacta al administrador del sistema.');
        } else {
            alert('Error al actualizar favorito:\n' + error.message);
        } 
    } finally {
        setTimeout(() => {
            favBtn.style.pointerEvents = 'auto';
        }, 300);
    }
}

async function toggleLike(idPublicacion) {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        mostrarLoginRequerido();
        return;
    }
    
    const likeBtn = document.querySelector(`[data-id="${idPublicacion}"] .like-btn`);
    const countSpan = likeBtn.querySelector('.count');
    const isActive = likeBtn.classList.contains('active');
    
    try {
        const response = await fetch('Public/php/api_likes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: isActive ? 'remove' : 'add',
                correo: usuarioActual.correo || usuarioActual.email,
                id_publicacion: idPublicacion
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            likeBtn.classList.toggle('active');
            const currentCount = parseInt(countSpan.textContent) || 0;
            countSpan.textContent = isActive ? Math.max(0, currentCount - 1) : currentCount + 1;

            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 150);
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error toggle like:', error);
        alert('Función de likes en desarrollo');
    }
}


function mostrarLoginRequerido() {
    if (confirm('Debes iniciar sesión para interactuar con las publicaciones. ¿Quieres ir a la página de login?')) {
        window.location.href = 'login.html';
    }
}

function filtrarYOrdenarPublicaciones() {
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const sort = document.getElementById('sortSelect')?.value || 'chronological';

    let filtered = publiGlobal;

    if (activeFilter !== 'all') {
        filtered = publiGlobal.filter(pub => {
            return String(pub.fk_Mundial) === String(activeFilter);
        });
    }


    switch (sort) {
        case 'country':
            filtered.sort((a, b) => (a.pais_publicacion || '').localeCompare(b.pais_publicacion || ''));
            break;
        case 'likes':
            filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'comments':
            filtered.sort((a, b) => (b.comentarios || 0) - (a.comentarios || 0));
            break;
        default:
            filtered.sort((a, b) => new Date(b.fechahora_publicacion) - new Date(a.fechahora_publicacion));
    }

    const container = document.querySelector('.mostrar-publicaciones');
    mostrarPublicacionesAprobadas(filtered, container);
}

async function cargarDatos() {
    const container = document.querySelector('.mostrar-datos');
    
    if (!container) {
        console.error('Container .mostrar-datos no encontrado');
        return;
    }
    container.innerHTML = '<div class="loading">Cargando datos...</div>';

    try {
        const response = await fetch('Public/php/api_datos.php?endpoint=todas');
        
        const text = await response.text();
            
        if (!text || text.trim().length === 0) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('Texto que falló:', text.substring(0, 500));
            throw new Error('Respuesta no es JSON válido');
        }
        
        console.log('Datos recibidos:', data);

       if (data.status === 'success') {
    mostrarDatos(data.data, container);
} else {
    throw new Error(data.message || 'Error desconocido en la API');
}
    } catch (error) {
        console.error('Error:', error);
    }
}

let datosCuriosos = [];
let indiceDato = 0;

function mostrarDatos(datos, container) {
    datosCuriosos = datos;
    indiceDato = 0;
    renderDatoCurioso(container);
}

function renderDatoCurioso(container) {
    if (!datosCuriosos.length) {
        container.innerHTML = '<div class="loading">No hay datos curiosos.</div>';
        return;
    }
    const dat = datosCuriosos[indiceDato];
    container.innerHTML = `
        <div class="posts-header">
            <h2><strong>Datos Curiosos</strong></h2>
        </div>
        <div class="post-card-data dato-slider">
            <button id="prev-dato" ${indiceDato === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
           <div class="post-card-content-data">
                <h3>${dat.titulo || 'Sin título'}</h3>
                <p class="post-content-data">${dat.dato || 'Sin contenido'}</p>
            </div>
            <button id="next-dato" ${indiceDato === datosCuriosos.length - 1 ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
        </div>
    `;

    document.getElementById('prev-dato').onclick = () => {
        if (indiceDato > 0) {
            indiceDato--;
            renderDatoCurioso(container);
        }
    };
    document.getElementById('next-dato').onclick = () => {
        if (indiceDato < datosCuriosos.length - 1) {
            indiceDato++;
            renderDatoCurioso(container);
        }
    };

document.querySelector('.search-bar button').addEventListener('click', buscarPubli);
document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscarPubli();
});

async function buscarPubli() {
    const texto = document.querySelector('.search-bar input').value.trim().toLowerCase();
    if (!texto) {
        filtrarYOrdenarPublicaciones();
        return;
    }

    const resultados = publiGlobal.filter(pub => {
        const categoria = (pub.categoria || '').toLowerCase();
        const year = (pub.year || pub.Year_Mundial || '').toString().toLowerCase();
        const pais = (pub.pais_publicacion || pub.mundial || pub.paismundial || '').toLowerCase();
        const sede = (pub.sede || '').toLowerCase();
        const usuario = (pub.usuario || pub.nombre_completo || pub.correo || '').toLowerCase();
        const titulo = (pub.titulo || '').toLowerCase();
        const contenido = (pub.contenido || '').toLowerCase();

        return (
            categoria.includes(texto) ||
            year.includes(texto) ||
            pais.includes(texto) ||
            sede.includes(texto) ||
            usuario.includes(texto) ||
            titulo.includes(texto) ||
            contenido.includes(texto)
        );
    });

    mostrarPublicacionesAprobadas(resultados, document.querySelector('.mostrar-publicaciones'));
}










}