document.addEventListener('DOMContentLoaded', async () => {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;

    await cargarDatosUsuario(usuario.email);

    setupButtons();

    await cargarPublicacionesUsuario(usuario.email);
    await cargarFavoritosUsuario(usuario.email);

    const btnEditarFoto = document.getElementById('btn-editar-foto');
if (btnEditarFoto) {
    btnEditarFoto.onclick = function() {
        const inputFoto = document.getElementById('input-foto');
        if (inputFoto) inputFoto.click();
    };
}

const closePubliEditModal = document.getElementById('publicloseeditModal');
if (closePubliEditModal) {
    closePubliEditModal.onclick = function() {
        document.getElementById('publiEDITModal').style.display = 'none';
    };
}

const inputFoto = document.getElementById('input-foto');
if (inputFoto) {
    inputFoto.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 16 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('La imagen es demasiado grande. El tamaño máximo permitido es 16MB.');
                inputFoto.value = '';
            }
            const reader = new FileReader();
            reader.onload = function(ev) {
                const editFoto = document.getElementById('edit-foto');
                if (editFoto) {
                    editFoto.src = ev.target.result;
                    editFoto.dataset.fotoBase64 = ev.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    };
}
    document.getElementById('btn-editar').addEventListener('click', async () => {
        const usuario = obtenerUsuarioActual();
        if (!usuario) return;

        const userData = await obtenerDatosUsuario(usuario.email);

        document.getElementById('edit-nombre').value = userData.nombre_completo || '';
        document.getElementById('edit-fecha').value = userData.fecha_nacimiento || '';
        document.getElementById('edit-genero').value = userData.genero || '';
        document.getElementById('edit-pais').value = userData.pais_nacimiento || '';
        document.getElementById('edit-nacionalidad').value = userData.nacionalidad || '';
        document.getElementById('edit-correo').value = userData.correo || '';
        document.getElementById('edit-password').value  = userData.contrasena || '';
        document.getElementById('editModal').style.display = 'block';
    });

    const closeEditModal = document.getElementById('closeeditModal');
if (closeEditModal) {
    closeEditModal.onclick = function() {
        document.getElementById('editModal').style.display = 'none';
    };
}

    const editForm = document.getElementById('edit-form');
if (editForm) {
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const usuario = obtenerUsuarioActual();
        if (!usuario) return;

        const datos = {
            correo_actual: usuario.email,
            nombre: document.getElementById('edit-nombre').value,
            fecha: document.getElementById('edit-fecha').value,
            genero: document.getElementById('edit-genero').value,
            pais: document.getElementById('edit-pais').value,
            nacionalidad: document.getElementById('edit-nacionalidad').value,
            correo_nuevo: document.getElementById('edit-correo').value,
            password: document.getElementById('edit-password').value,
            foto_base64: document.getElementById('edit-foto').dataset.fotoBase64 || ''
        };
const confirmar = confirm('¿Estás seguro de realizar estos cambios en tu perfil?');
    if (!confirmar) {
        return;
    }
        try {
            const response = await fetch('Public/php/api_user_profile.php?endpoint=update_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const result = await response.json();
            const msgDiv = document.getElementById('edit-msg');
            if (result.status === 'success') {
                msgDiv.innerHTML = '<span style="color:green;">Perfil actualizado correctamente</span>';
                setTimeout(() => {
                    document.getElementById('editModal').style.display = 'none';
                    location.reload();
                }, 1200);
            } else {
                msgDiv.innerHTML = `<span style="color:red;">${result.message}</span>`;
            }
        } catch (error) {
            document.getElementById('edit-msg').innerHTML = `<span style="color:red;">Error escoge una imagen mas pequeña</span>`;
        }
    });
}

});

async function cargarDatosUsuario(correo) {
    try {
        const response = await fetch(`Public/php/api_user_profile.php?endpoint=get_user&correo=${encodeURIComponent(correo)}`);
        const result = await response.json();
        if (result.status === 'success') {
            const user = result.data;
            document.getElementById('edit-foto').src = user.foto_url || 'Imagenes/default-user.png';
            document.getElementById('profile-foto').src = user.foto_url || 'Imagenes/default-user.png';
            document.getElementById('profile-name').textContent = user.nombre_completo || 'Sin nombre';
            document.getElementById('profile-email').textContent = user.correo || 'Sin email';
            document.getElementById('profile-genero').textContent = user.genero || 'Sin género';
            document.getElementById('profile-contra').textContent = user.contrasena || 'Sin contraseña';
            document.getElementById('profile-fecha').textContent = formatearFecha(user.fecha_nacimiento) || 'Sin fecha';
            document.getElementById('profile-pais').textContent = user.pais_nacimiento || 'Sin país';
            document.getElementById('profile-nacionalidad').textContent = user.nacionalidad || 'Sin nacionalidad';
        }
    } catch (error) {
        console.error('Error cargando datos usuario:', error);
    }
}

async function obtenerDatosUsuario(correo) {
    try {
        const response = await fetch(`Public/php/api_user_profile.php?endpoint=get_user&correo=${encodeURIComponent(correo)}`);
        const result = await response.json();
        if (result.status === 'success') {
            return result.data;
        }
    } catch (error) {
        console.error('Error obteniendo datos usuario:', error);
    }
    return {};
}

document.addEventListener('DOMContentLoaded', async () => {

    

    const usuario = obtenerUsuarioActual();
    if (!usuario) { 
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h2>Sesión no encontrada</h2>
                <p>No hay datos de usuario en el sistema.</p>
                <p>Por favor, inicia sesión para continuar.</p>
                <br>
                <button onclick="window.location.href='login.html'" style="padding: 10px 20px; font-size: 16px; margin: 10px;">
                    Ir a Login
                </button>
                <br>
                <button onclick="simularLogin()" style="padding: 10px 20px; font-size: 14px; background: #28a745; color: white; border: none; border-radius: 4px; margin: 10px;">
                    Simular Login (Para pruebas)
                </button>
            </div>
        `;
        return;
    }
    
    setupButtons();
    
    await cargarPublicacionesUsuario(usuario.email);
    
    await cargarFavoritosUsuario(usuario.email);
});

async function cargarPublicacionesUsuario(correoUsuario) {
    const container = document.getElementById('posts-container');
    
    if (!container) {
        console.error('Container posts-container no encontrado');
        return;
    }
    
    console.log('Cargando MIS publicaciones para:', correoUsuario);
    
    container.innerHTML = '<div class="loading" style="text-align: center; padding: 20px;">⏳ Cargando mis publicaciones...</div>';
    
    try {
        const baseUrl = window.location.origin + window.location.pathname.replace('perfil.html', '');
        const apiUrl = `${baseUrl}Public/php/api_user_profile.php`;
        const params = new URLSearchParams({
            endpoint: 'usuario',
            correo: correoUsuario
        });
        const url = `${apiUrl}?${params.toString()}`;
        
        console.log('URL completa para publicaciones:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Response status publicaciones:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error HTTP publicaciones:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
        }
        
        const text = await response.text();
        console.log('Response publicaciones length:', text.length);
        
        if (!text || text.trim().length === 0) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        const data = JSON.parse(text.trim());
        console.log('Publicaciones del usuario:', data);

        if (data.status === 'success') {
            console.log(`${data.total} publicaciones del usuario encontradas`);
            mostrarPublicaciones(data.data, container, false, 'mis publicaciones');
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error cargando publicaciones:', error);
        container.innerHTML = `
            <div class="error-posts" style="padding: 20px; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 10px 0;">
                <h4>Error al cargar mis publicaciones</h4>
                <p><strong>Detalles:</strong> ${error.message}</p>            
            </div>
        `;
    }
}

async function cargarFavoritosUsuario(correoUsuario) {
    const container = document.getElementById('favorites-container');
    
    if (!container) {
        console.error('Container favorites-container no encontrado');
        return;
    }
    
    console.log('Cargando favoritos para:', correoUsuario);
    
    container.innerHTML = '<div class="loading" style="text-align: center; padding: 20px;">⏳ Cargando mis favoritos...</div>';
    
    try {
        const baseUrl = window.location.origin + window.location.pathname.replace('perfil.html', '');
        const apiUrl = `${baseUrl}Public/php/api_user_profile.php`;
        const params = new URLSearchParams({
            endpoint: 'favoritos',
            correo: correoUsuario
        });
        const url = `${apiUrl}?${params.toString()}`;
        
        console.log('URL completa para favoritos:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Response status favoritos:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error HTTP favoritos:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
        }
        
        const text = await response.text();
        console.log('Response favoritos length:', text.length);
        console.log('Response favoritos:', text);
        
        if (!text || text.trim().length === 0) {
            throw new Error('Respuesta vacía del servidor para favoritos');
        }
        
        const data = JSON.parse(text.trim());

        if (data.status === 'success') {
            mostrarPublicaciones(data.data, container, true, 'favoritos');
        } else {
            
            if (data.message.includes('Table') && data.message.includes("doesn't exist")) {
                container.innerHTML = `
                    <div class="info-favoritos" style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; margin: 10px 0;">
                        <p>La tabla de favoritos no existe en la base de datos</p>
                        <p><small>Necesitas crear la tabla FavoritosPublicacion</small></p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="info-favoritos" style="text-align: center; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 10px 0;">
                        <p>Error cargando favoritos</p>
                        <p><small>${data.message}</small></p>          
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        container.innerHTML = `
            <div class="info-favoritos" style="text-align: center; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; margin: 10px 0;">
                <p>Error cargando favoritos</p>
                <p><small>Detalles: ${error.message}</small></p>       
            </div>
        `;
    }
}

function mostrarPublicaciones(publicaciones, container, esFavorito = false, tipo = '') {
    console.log(`Mostrando ${publicaciones.length} ${tipo || (esFavorito ? 'favoritos' : 'publicaciones')}`);
    container.innerHTML = '';
    
    if (publicaciones.length === 0) {
        container.innerHTML = esFavorito ? 
            '<div class="no-posts"><p>No tienes publicaciones favoritas</p><small>Explora publicaciones y marca tus favoritas</small></div>' :
            '<div class="no-posts"><p>No tienes publicaciones</p><small>¡Crea tu primera publicación!</small></div>';
        return;
    }
    
    publicaciones.forEach((pub, index) => {
        console.log(`${tipo} ${index + 1}:`, pub);
        
        const div = document.createElement('div');
        div.className = 'post-card';
        div.setAttribute('data-id', pub.id_publicacion);
        
        let estadoAprobacion = '';
        if (!esFavorito && pub.aprovacion !== undefined) {
            estadoAprobacion = pub.aprovacion == 1 
                ? '<span class="status approved">Aprobada</span>'
                : '<span class="status pending">Pendiente</span>';
        } else if (esFavorito) {
            estadoAprobacion = '<span class="status favorite"><i class="fas fa-star"></i> Favorito</span>';
        }
        const fecha = formatearFecha(pub.fechahora_publicacion);
        
        const autorInfo = esFavorito && pub.correo ? 
            `<div class="autor-info">Por: ${pub.correo}</div>` : '';
        
 
        const imagenSrc = obtenerImagenPublicacionConBlob(pub);
        console.log(`Imagen para publicación ${pub.id_publicacion}:`, imagenSrc);
        

        const imagenInfo = pub.tiene_imagen_blob 
            ? `Imagen BLOB: ${pub.tamaño_imagen_kb} KB`
            : 'Sin imagen BLOB';
            

        const esImagenValida = pub.media_size && pub.media_size > 1024; 
        const alertaTamaño = !esImagenValida && pub.tiene_imagen_blob
            ? `<div style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; margin: 5px 0; font-size: 11px;">
                Imagen pequeña (${pub.media_size || 0} bytes)
               </div>`
            : '';
        
        div.innerHTML = `
            <div class="post-card-image" style="position: relative;">
                <img id="img-${pub.id_publicacion}"
                     src="https://via.placeholder.com/400x300/e9ecef/6c757d?text=Cargando..." 
                     alt="Imagen de ${pub.titulo}" 
                     class="post-img" 
                     loading="lazy"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                     onerror="console.log('Error en imagen perfil:', this.src); this.src='Imagenes/default-post.jpg';">
                
               
            </div>

            <div class="post-card-content">
                <h3>${pub.titulo || 'Sin título'} ${pub.id_publicacion || 0}</h3>
                ${autorInfo}
                <p class="post-content">${pub.contenido || 'Sin contenido'}</p>

                ${pub.pais_publicacion ? `<div class="post-meta">
                    <span class="categoria"><i class="fas fa-map-marker-alt"></i> ${pub.pais_publicacion}</span>
                </div>` : ''}
                
                <div class="post-stats">
                    <span class="stat"><i class="fas fa-thumbs-up"></i> ${pub.likes || 0}</span>
                    <span class="stat"><i class="fas fa-comments"></i> ${pub.comentarios || 0}</span>
                    <span class="stat"><i class="fas fa-calendar-alt"></i> <strong> ${fecha}</strong></span>
                </div>
                
                ${estadoAprobacion}
            </div>
            
            <div class="post-actions">
                ${esFavorito ? 
                    `<button class="action-btn favorite-btn active" 
                             onclick="toggleFavorito(${pub.id_publicacion})" 
                             title="Eliminar de favoritos">
                        <i class="fas fa-star"></i> 
                     
                    </button>` :
                    `<button class="btn-action editpubli" title="Editar publicación">
                        <i class="fas fa-edit"></i> 
                    </button>`
                }
                ${!esFavorito ? 
                    `<button class="btn-action delete" onclick="eliminarPublicacion(${pub.id_publicacion})" title="Eliminar publicación">
                        <i class="fas fa-trash"></i> 
                    </button>` : ''
                }
              
            </div>
        `;
        
        container.appendChild(div);
    
        detectarYActualizarImagenPerfil(pub.id_publicacion, pub);
    });
}

document.addEventListener('click', function(e) {
    if (e.target.closest('.editpubli')) {
        const card = e.target.closest('.post-card');
        console.log('Click en editar, card:', card);
        if (card) {
            const id = card.getAttribute('data-id');
            console.log('ID detectado:', id);
            editarPublicacion(id);
        }
    }
});

function obtenerImagenPublicacionConBlob(publicacion) {

    if (publicacion.tiene_imagen_blob && publicacion.imagen_blob_url) {
        console.log('imagen:', publicacion.imagen_blob_url);
        return publicacion.imagen_blob_url;
    }
    
    const imagenBD = publicacion.media || publicacion.imagen || publicacion.photo;
    
    if (!imagenBD || imagenBD.trim() === '' || imagenBD === 'null' || imagenBD === null) {
        return 'Imagenes/default-post.jpg';
    }
    
    if (imagenBD.startsWith('http://') || imagenBD.startsWith('https://')) {
        return imagenBD;
    }
    
    if (imagenBD.startsWith('Public/') || imagenBD.startsWith('uploads/')) {
        return imagenBD;
    }
    

    if (imagenBD && !imagenBD.includes('/')) {
        return `uploads/${imagenBD}`;
    }
    
    return imagenBD;
}


async function detectarYActualizarImagenPerfil(idPublicacion, publicacion) {
    try {
        const imgElement = document.getElementById(`img-${idPublicacion}`);
        const loadingElement = document.getElementById(`loading-${idPublicacion}`);
        const statusElement = document.getElementById(`status-${idPublicacion}`);
        
        console.log(' encontrados:', {
            img: !!imgElement,
            loading: !!loadingElement,
            status: !!statusElement
        });
        
        if (imgElement) {
            if (publicacion.tiene_imagen_blob && publicacion.imagen_blob_url) {

                fetch(publicacion.imagen_blob_url, { method: 'HEAD' })
                    .then(response => {
                        const size = response.headers.get('X-Image-Size');
                        const debugSize = response.headers.get('X-Debug-Size');
                        
                        imgElement.src = publicacion.imagen_blob_url;
                        
                        imgElement.onload = () => {
                           
                            if (loadingElement) {
                                loadingElement.style.display = 'none';
                            }
                            if (statusElement) {
                                let statusText = 'cargado';
                                if (size) {
                                    statusText += ` (${size} bytes)`;
                                } else if (debugSize) {
                                    statusText += ` (${debugSize})`;
                                }
                                statusElement.innerHTML = statusText;
                                statusElement.style.color = '#28a745';
                            }
                        };
                        
                        imgElement.onerror = () => {
                            console.log(`Error cargando imagen ${idPublicacion}`);
                            if (loadingElement) {
                                loadingElement.style.display = 'none';
                            }
                            if (statusElement) {
                                statusElement.innerHTML = `Error BLOB`;
                                statusElement.style.color = '#dc3545';
                            }

                            imgElement.src = 'Imagenes/default-post.jpg';
                        };
                    })
                    .catch(error => {
                        console.error('Error verificando headers BLOB perfil:', error);

                        imgElement.src = publicacion.imagen_blob_url;
                    });
                    
            } else {

                const imagenTradicional = obtenerImagenPublicacionConBlob(publicacion);
                console.log(`Usando imagen tradicional en perfil: ${imagenTradicional}`);
                
                imgElement.src = imagenTradicional;
                
                imgElement.onload = () => {
                    if (loadingElement) loadingElement.style.display = 'none';
                    if (statusElement) {
                        statusElement.innerHTML = 'Imagen tradicional';
                        statusElement.style.color = '#17a2b8';
                    }
                };
                
                imgElement.onerror = () => {
                    if (loadingElement) loadingElement.style.display = 'none';
                    if (statusElement) {
                        statusElement.innerHTML = 'Sin imagen';
                        statusElement.style.color = '#6c757d';
                    }
                    imgElement.src = 'Imagenes/default-post.jpg';
                };
            }
        }
        
    } catch (error) {
        console.error(`Error imagen ${idPublicacion}:`, error);
        
        const loadingElement = document.getElementById(`loading-${idPublicacion}`);
        const statusElement = document.getElementById(`status-${idPublicacion}`);
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (statusElement) {
            statusElement.innerHTML = `Error: ${error.message}`;
            statusElement.style.color = '#dc3545';
        }
    }
}

function obtenerImagenPublicacion(imagenBD) {
    
    if (!imagenBD || imagenBD.trim() === '' || imagenBD === 'null' || imagenBD === null) {
        return 'Imagenes/default-post.jpg';
    }
    
    if (imagenBD.startsWith('http://') || imagenBD.startsWith('https://')) {
        return imagenBD;
    }
    
    if (imagenBD.startsWith('Public/') || imagenBD.startsWith('uploads/')) {
        return imagenBD;
    }
    
    if (imagenBD && !imagenBD.includes('/')) {
        return `uploads/${imagenBD}`;
    }
    
    return imagenBD;
}

async function toggleFavorito(idPublicacion) {
    console.log('Toggle favorito eliminar: ', idPublicacion);
    
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        alert('Error: No se pudo obtener la información del usuario');
        return;
    }
    const favBtn = document.querySelector(`[data-id="${idPublicacion}"] .favorite-btn`);
    
    if (!favBtn) {
        const allCards = document.querySelectorAll('[data-id]');
        console.log('Tarjetas disponibles:', Array.from(allCards).map(card => ({
            id: card.getAttribute('data-id'),
            hasBtn: !!card.querySelector('.favorite-btn')
        })));
        alert('Error: No se encontró el botón de favorito. Recarga la página.');
        return;
    }
    
    if (!confirm('¿Quitar esta publicación de favoritos?')) {
        return;
    }
    
    favBtn.style.pointerEvents = 'none';
    const originalHTML = favBtn.innerHTML;
    
    favBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="count">⏳</span>';
    favBtn.style.transition = 'all 0.3s ease';
    favBtn.style.transform = 'scale(0.95)';
    favBtn.style.opacity = '0.7';
    
    try {
        console.log('eliminar favorito:', {
            action: 'remove',
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
                action: 'remove',
                correo: usuarioActual.correo || usuarioActual.email,
                id_publicacion: idPublicacion
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('El archivo api_favoritos.php no se encuentra o hay un error de servidor');
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            throw new Error('La respuesta del servidor no es JSON válido');
        }
        
        console.log('Parsed data:', data);
        
        if (data.status === 'success') {
            console.log('Favorito eliminado exitosamente');

            const postCard = favBtn.closest('.post-card');
            
            if (postCard) {
                postCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                postCard.style.transform = 'scale(0.8) translateY(-20px)';
                postCard.style.opacity = '0';
                postCard.style.filter = 'blur(2px)';
                
                setTimeout(() => {
                    postCard.style.transform = 'scale(0.8) translateX(-100px) translateY(-20px)';
                }, 300);
                
                setTimeout(() => {
                    postCard.remove();
                    
                    const container = document.getElementById('favorites-container');
                    const remainingCards = container.querySelectorAll('.post-card');
                    
                    if (remainingCards.length === 0) {
                        container.innerHTML = `
                            <div class="no-posts" style="text-align: center; padding: 40px; background: var(--bg-card, #fff); border-radius: 8px; margin: 20px 0; opacity: 0; transform: translateY(20px); transition: all 0.5s ease;">
                                <p style="font-size: 48px; margin: 0;">⭐</p>
                                <p style="font-size: 18px; margin: 10px 0;">No tienes publicaciones favoritas</p>
                                <p><small>Explora publicaciones y marca tus favoritas</small></p>
                            </div>
                        `;
                        
                        setTimeout(() => {
                            const noPostsDiv = container.querySelector('.no-posts');
                            if (noPostsDiv) {
                                noPostsDiv.style.opacity = '1';
                                noPostsDiv.style.transform = 'translateY(0)';
                            }
                        }, 100);
                    }
                }, 900);
            }
            
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
        
    } catch (error) {
        console.error('Error eliminar favorito:', error);
        
        favBtn.innerHTML = originalHTML;
        favBtn.style.transform = 'scale(1)';
        favBtn.style.opacity = '1';
        
        favBtn.style.animation = 'shake 0.5s ease-in-out';
        favBtn.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
        favBtn.style.borderColor = '#dc3545';
        
        setTimeout(() => {
            favBtn.style.animation = '';
            favBtn.style.backgroundColor = '';
            favBtn.style.borderColor = '';
        }, 500);
        
        if (error.message.includes('api_favoritos.php no se encuentra')) {
            alert('Función de favoritos no disponible\n\nEl archivo api_favoritos.php no existe.\nContacta al administrador del sistema.');
        } else {
            alert('Error al eliminar favorito:\n' + error.message);
        }
        
    } finally {
        setTimeout(() => {
            if (favBtn && favBtn.parentNode) {
                favBtn.style.pointerEvents = 'auto';
            }
        }, 300);
    }
}

async function editarPublicacion(idPublicacion) {
    console.log('ID a editar:', idPublicacion);
    document.getElementById('publiEDITModal').style.display = 'block';
    document.getElementById('edit-publication-id').value = idPublicacion;

    try {
        const response = await fetch('Public/php/api_publi_new.php?endpoint=todas2');
        const data = await response.json();

        if (data.status !== 'success') {
            alert('Error cargando publicaciones');
            return;
        }

        const pub = data.data.find(pub => pub.id_publicacion == idPublicacion);
        if (!pub) {
            alert('No se encontró la publicación');
            return;
        }

       document.getElementById('edit-publication-title').value = pub.titulo || '';
        document.getElementById('post-country').value = pub.pais_publicacion || '';
        document.getElementById('edit-publication-description').value = pub.contenido || '';
        document.getElementById('post-worldcup').value = pub.fk_Mundial || '';
        document.getElementById('post-category').value = pub.fk_Categoria || '';
        document.getElementById('like-count-modal').textContent = pub.likes || 0;
        document.getElementById('comments-count-modal').textContent = pub.comentarios || 0;
        document.getElementById('edit-foto-publi').src = pub.imagen_blob_url || 'Imagenes/default-user.png';

        await cargarCategoriasYSeleccionar(pub.fk_Categoria);
        await cargarMundialesYSeleccionar(pub.fk_Mundial);

    } catch (error) {
        alert('Error al cargar la publicación para editar');
        console.error(error);
    }
}
window.editarPublicacion = editarPublicacion;
async function cargarCategoriasYSeleccionar(selectedId) {
    const select = document.getElementById('post-category');
    select.innerHTML = '<option value="">Cargando...</option>';
    const res = await fetch('Public/php/api_cat.php');
    const data = await res.json();
    select.innerHTML = '<option value="">Selecciona una categoría</option>';
    if (data.status === 'success') {
        data.data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            if (cat.id == selectedId) option.selected = true;
            select.appendChild(option);
        });
    }
}

async function cargarMundialesYSeleccionar(selectedId) {
    const select = document.getElementById('post-worldcup');
    select.innerHTML = '<option value="">Cargando...</option>';
    const res = await fetch('Public/php/api_mundiales.php');
    const data = await res.json();
    select.innerHTML = '<option value="">Selecciona un mundial</option>';
    if (data.status === 'success') {
        data.data.forEach(mundial => {
            const option = document.createElement('option');
            option.value = mundial.id;
            option.textContent = `${mundial.year} - ${mundial.country}`;
            if (mundial.id == selectedId) option.selected = true;
            select.appendChild(option);
        });
    }
}
async function eliminarPublicacion(idPublicacion) {
    if (!confirm('Estas seguro de que quieres eliminar esta publicación?')) return;
    const usuario = obtenerUsuarioActual();
    if (!usuario) return alert('Sesion no valida');
    console.log('Eliminar publicación:', idPublicacion, usuario.email || usuario.correo);
   const res = await fetch('Public/php/api_publi_new.php?endpoint=eliminar', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id_publicacion=${idPublicacion}&correo=${usuario.email || usuario.correo}`
});
const data = await res.json();
    if (data.status === 'success') {
        alert('Publieliminada correctamente');
        location.reload();
    } else {
        alert(data.message || 'Error al eliminar publi');
    }
}

function obtenerUsuarioActual() {
    try {
        const correo = localStorage.getItem('userEmail');
        const nombre = localStorage.getItem('userName');
        const id = localStorage.getItem('userId');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        
        if (!correo || !nombre || isLoggedIn !== 'true') {
            console.error('Datos de usuario no encontrados o no logueado');
            return null;
        }
        
        return {
            email: correo,
            name: nombre,
            id: id,
            correo: correo
        };
        
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
}

function setupButtons() {
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

function displayUserProfile(user) {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilecontra = document.getElementById('profile-contra');
    const profilegenero = document.getElementById('profile-genero');
    const profileFoto = document.getElementById('profile-foto');
    const profileFecha = document.getElementById('profile-fecha');
    const profilePais = document.getElementById('profile-pais');
    const profileNacionalidad = document.getElementById('profile-nacionalidad');

    if (profileName) profileName.textContent = user.name || 'Sin nombre';
    if (profileEmail) profileEmail.textContent = user.email || 'Sin email';
    if (profilegenero) profilegenero.textContent = user.genero || 'Sin género';
    if (profilecontra) profilecontra.textContent = user.contra || 'Sin contraseña';
    if (profileFoto) profileFoto.src = user.foto_url || user.foto || 'Imagenes/default-user.png';
    if (profileFecha) profileFecha.textContent = formatearFecha(user.fecha_nacimiento) || 'Sin fecha';
    if (profilePais) profilePais.textContent = user.pais_nacimiento || 'Sin país';
    if (profileNacionalidad) profileNacionalidad.textContent = user.nacionalidad || 'Sin nacionalidad';
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    try {
        const date = new Date(fecha);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const año = date.getFullYear();
        
        return `${dia}/${mes}/${año}`;
    } catch (e) {
        return fecha;
    }
}

 const categorySelect = document.getElementById('post-category');
    if (categorySelect) {
        fetch('Public/php/api_cat.php')
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    result.data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id; 
                        option.textContent = cat.nombre;
                        categorySelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                categorySelect.innerHTML += '<option value="">Error cargando categorías</option>';
            });
    }

    const worldcupSelect = document.getElementById('post-worldcup');
if (worldcupSelect) {
    fetch('Public/php/api_mundiales.php')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                result.data.forEach(mundial => {
                    const option = document.createElement('option');
                    option.value = mundial.id;
                    option.textContent = `${mundial.year} - ${mundial.country}`;
                    worldcupSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            worldcupSelect.innerHTML += '<option value="">Error cargando mundiales</option>';
        });
}

const inputFotoPubli = document.getElementById('input-foto-publi');
const btnEditarFotoPubli = document.getElementById('btn-editar-foto-publi');
const editFotoPubli = document.getElementById('edit-foto-publi');
let nuevaFotoBase64 = null;

if (btnEditarFotoPubli && inputFotoPubli && editFotoPubli) {
    btnEditarFotoPubli.onclick = () => inputFotoPubli.click();

    inputFotoPubli.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            const compressed = await comprimirImagen(file, 1200, 1200, 0.8);
            const reader = new FileReader();
            reader.onload = function(ev) {
                editFotoPubli.src = ev.target.result; 
                nuevaFotoBase64 = ev.target.result;   
            };
            reader.readAsDataURL(compressed);
        }
    };
}

const formEditPubli = document.getElementById('edit-form-publi');
if (formEditPubli) {
    formEditPubli.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('edit-publication-id').value;
        const titulo = document.getElementById('edit-publication-title').value.trim();
        const pais = document.getElementById('post-country').value.trim();
        const fk_categoria = document.getElementById('post-category').value;
        const fk_mundial = document.getElementById('post-worldcup').value;
        const contenido = document.getElementById('edit-publication-description').value.trim();

        if (!titulo || !pais || !fk_categoria || !fk_mundial || !contenido) {
            alert('Completa todos los campos obligatorios');
            return;
        }

        let foto = nuevaFotoBase64 || editFotoPubli.src;
        if (foto.includes('default-user.png')) {
            foto = null;
        }
        const datos = {
            id_publicacion: id,
            titulo,
            contenido,
            pais_publicacion: pais,
            fk_Categoria: fk_categoria,
            fk_Mundial: fk_mundial,
            foto_base64: foto
        };

        try {
            const res = await fetch('Public/php/api_publi_new.php?endpoint=editar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const text = await res.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                alert('Respuesta no es JSON válido:\n' + text);
                return;
            }
            if (result.status === 'success') {
                alert('Publi editada!');
                document.getElementById('publiEDITModal').style.display = 'none';
                location.reload();
            } else {
                alert(result.message || 'No se pudo editar la publicación');
            }
        } catch (error) {
            alert('Error al guardar la edición:\n' + error.message);
        }
    });
}

async function comprimirImagen(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                resolve(compressedFile);
            }, file.type, quality);
        };
        img.src = URL.createObjectURL(file);
    });
}