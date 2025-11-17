
document.addEventListener('DOMContentLoaded', async () => {
    
    const checkbox = document.getElementById("toggleTheme");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (checkbox) checkbox.checked = true;
    }
    
    const userRole = localStorage.getItem("userRole");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn || userRole !== 'admin') {
        alert("Acceso denegado. Solo administradores pueden acceder a esta página.");
        window.location.href = "index.html";
        return;
    }
    
    await cargarPublicacionesPendientes();
});


async function cargarCategorias() {
    const grid = document.getElementById('post-category');
    grid.innerHTML = '<div>Cargando...</div>';
    const res = await fetch('Public/php/api_cat_edicion.php?endpoint=categorias');
    const data = await res.json();
    grid.innerHTML = '';
    if (data.status === 'success') {
        data.data.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'categoria-card';
            div.innerHTML = `
                <span>${cat.nombrecategoria}</span>
                <div>
                  <button class="btn-action editpubli" title="Editar categoría" onclick="mostrarEditarCategoria(${cat.idcat}, '${cat.nombrecategoria.replace(/'/g, "\\'")}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action delete" title="Eliminar categoría" onclick="eliminarCategoria(${cat.idcat})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
            `;
            grid.appendChild(div);
        });
    }
}

async function crearCategoria() {
    const input = document.getElementById('categoria');
    const nombre = input.value.trim();
    if (!nombre) return alert('Ingresa un nombre');
    const res = await fetch('Public/php/api_cat_edicion.php?endpoint=crear_categoria', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nombre})
    });
    const data = await res.json();
    if (data.status === 'success') {
        input.value = '';
        cargarCategorias();
    } else {
        alert('No se pudo crear');
    }
}

function mostrarEditarCategoria(id, nombre) {
    const nuevoNombre = prompt('Editar nombre de la categoría:', nombre);
    if (nuevoNombre && nuevoNombre.trim() !== '' && nuevoNombre !== nombre) {
        editarCategoria(id, nuevoNombre.trim());
    }
}

async function editarCategoria(id, nombre) {
    const res = await fetch('Public/php/api_cat_edicion.php?endpoint=editar_categoria', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, nombre})
    });
    const data = await res.json();
    if (data.status === 'success') {
        cargarCategorias();
    } else {
        alert('No se pudo editar');
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    const res = await fetch('Public/php/api_cat_edicion.php?endpoint=eliminar_categoria', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id})
    });
    const data = await res.json();
    if (data.status === 'success') {
        cargarCategorias();
    } else {
        alert('No se pudo eliminar');
    }
}

document.addEventListener('DOMContentLoaded', cargarCategorias);

async function cargarPublicacionesPendientes() {
    const contenedor = document.getElementById('pendientes');
    
    if (!contenedor) {
        console.error('No se encuentra pendientes');
        return;
    }
    
    console.log('Cargando publicaciones pendientes...');
    
    contenedor.innerHTML = '<div class="loading">Cargando publicaciones pendientes...</div>';
    
    try {
        const response = await fetch('Public/php/api_admin_new.php?endpoint=pendientes&limite=50');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response:', text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Error en JSON:', parseError);
            throw new Error('Respuesta no es JSON');
        }
        
        console.log('Datos pendientes:', data);

        if (data.status === 'success') {
            if (data.data && data.data.length > 0) {
                console.log(`Encontradas ${data.data.length} publicaciones pendientes`);
                mostrarPublicacionesPendientes(data.data, contenedor);
            } else {
                console.log('No hay publicaciones pendientes');
                contenedor.innerHTML = `
                    <div class="no-pending">
                        <h3>No hay publicaciones pendientes</h3>
                        <p>Todas las publicaciones han sido revisadas</p>
                    </div>
                `;
            }
        } else {
            throw new Error(data.message || 'Error desconocido en la API');
        }
        
    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = `
            <div class="error-pending">
                <h3>Error al cargar publicaciones pendientes</h3>
                <p>${error.message}</p>
                <button class="btn-retry" onclick="cargarPublicacionesPendientes()">
                    Intentar de nuevo
                </button>
            </div>
        `;
    }
}

function mostrarPublicacionesPendientes(publicaciones, contenedor) {
    console.log(`Mostrando ${publicaciones.length} publis pendientes`);
    
    contenedor.innerHTML = '';
    
    publicaciones.forEach((pub, index) => {
        console.log(`Publicación pendiente ${index + 1}:`, pub);
        
        const div = document.createElement('div');
        div.className = 'publicacion-pendiente';
        div.setAttribute('data-id', pub.id_publicacion);
        
        const fecha = formatearFecha(pub.fechahora_publicacion);
        const imagenBD = pub.media || pub.imagen || pub.photo || '';

        const imagenInfo = pub.tiene_imagen_blob 
            ? `Imagen BLOB: ${pub.tamaño_imagen_kb} KB (${pub.media_size} bytes)`
            : 'Sin imagen';
            
        const esImagenValida = pub.media_size && pub.media_size > 1024; 
        const alertaTamaño = !esImagenValida && pub.tiene_imagen_blob
            ? `<div style="background: #fff3cd; color: #856404; padding: 8px; border-radius: 4px; margin: 5px 0; font-size: 12px;">
                <strong>Imagen muy pequeña (${pub.media_size} bytes)</strong> - Posiblemente corrupta
               </div>`
            : '';
        
        const estadoAprobacion = pub.aprovacion === null 
            ? '<span class="status pending">Pendiente</span>'
            : pub.aprovacion == 0 
                ? '<span class="status pending">Pendiente (0)</span>'
                : '<span class="status approved">Aprobada</span>';

        div.innerHTML = `
            <div class="pending-card">
                
             
                <div class="post-card-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 15px; position: relative; background: #f8f9fa;">
                    <img id="img-${pub.id_publicacion}" 
                         src="https://cdn-icons-png.freepik.com/512/6356/6356630.png" 
                         alt="Imagen de ${pub.titulo || 'Sin título'}" 
                         class="post-img" 
                         loading="lazy"
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="console.log('Error en imagen:', this.src); this.src='https://cdn-icons-png.flaticon.com/512/10809/10809585.png';">
                    
                   
                </div>

                <!-- Resto del contenido igual... -->
                <div class="pending-header">
                    <h3>${pub.titulo || 'Sin título'}</h3>
                    <span class="pending-date">${fecha}</span>
                </div>
                
                <div class="pending-card-content">
                    <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${pub.correo || 'No especificado'}</p>
                    <p><strong><i class="fas fa-map-marker-alt"></i> País:</strong> ${pub.pais_publicacion || 'No especificado'}</p>
                </div>
                
                <div class="pending-content">
                    <p>${pub.contenido || 'Sin contenido'}</p>
                </div>
                
                <div class="post-actions">
                    <span><i class="fas fa-thumbs-up"></i> ${pub.likes || 0}</span>
                    <span><i class="fas fa-comments"></i> ${pub.comentarios || 0}</span>
                    <span><i class="fas fa-calendar-alt"></i> <strong>${fecha}</strong></span>
                    <span><i class="fas fa-address-card"></i> ID: ${pub.id_publicacion}</span>
                </div>
                
                <div style="margin: 10px 0;">
                    ${estadoAprobacion}
                </div>
                
                <div class="pending-actions">
                    <button class="btn-aprobar" onclick="aprobarPublicacion(${pub.id_publicacion})"
                            title="Aprobar publicación">
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-rechazar" onclick="rechazarPublicacion(${pub.id_publicacion})"
                            title="Rechazar y eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        contenedor.appendChild(div);
        detectarYActualizarImagen(pub.id_publicacion, imagenBD);
    });
}

async function detectarRutaImagen(imagenBD) {
    console.log('Buscando:', imagenBD);
    
   
    if (!imagenBD || imagenBD.trim() === '' || imagenBD === 'null') {
        console.log('Media vacia imagen BLOB');
        return 'imagen_no_disponible';  
    }
    
  
    if (imagenBD.includes('/') || imagenBD.includes('\\') || imagenBD.includes('.')) {
        console.log(' ruta de archivo:', imagenBD);
        return await detectarRutaArchivoAnterior(imagenBD);
    } else {
        console.log('Datos BLOB');
        return 'imagen_blob'; 
    }
}

function construirUrlImagen(idPublicacion, tipoImagen) {
    if (tipoImagen === 'imagen_blob' || tipoImagen === 'imagen_no_disponible') {
        return `Public/php/show_image_blob.php?id=${idPublicacion}`;
    } else {       
        return tipoImagen;
    }
}

async function detectarYActualizarImagen(idPublicacion, imagenBD) {
    console.log(`Buscando imagen para publi: ${idPublicacion}, imagen BD: ${imagenBD}`);
    
    try {
        const tipoDetectado = await detectarRutaImagen(imagenBD);
        const urlImagen = construirUrlImagen(idPublicacion, tipoDetectado);
        
        console.log(`URL imagen ${idPublicacion}: ${urlImagen}`);
        
        const imgElement = document.getElementById(`img-${idPublicacion}`);
        const loadingElement = document.getElementById(`loading-${idPublicacion}`);
        const statusElement = document.getElementById(`status-${idPublicacion}`);
        
        console.log('Lo que hay:', {
            img: !!imgElement,
            loading: !!loadingElement,
            status: !!statusElement
        });
        
        if (imgElement) {
            imgElement.src = urlImagen;
            
            imgElement.onload = () => {
                console.log(`Se cargo imagen yeiii publi: ${idPublicacion}`);
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                if (statusElement) {
                    statusElement.innerHTML = `Imagen cargada`;
                    statusElement.style.color = '#28a745';
                }
            };
            
            imgElement.onerror = () => {
                console.log(`Error imagen BLOB publi: ${idPublicacion}`);
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                if (statusElement) {
                    statusElement.innerHTML = `Error imagen `;
                    statusElement.style.color = '#dc3545';
                }
                imgElement.src = 'https://cdn-icons-png.flaticon.com/512/10809/10809585.png';
            };
        }
        
    } catch (error) {
        console.error(`Error en la imagen publi: ${idPublicacion}:`, error);
    }
}

async function detectarRutaArchivoAnterior(imagenBD) {
    const posiblesRutas = [
        imagenBD,
        `uploads/${imagenBD}`,
        `Public/uploads/${imagenBD}`,
        `Public/images/${imagenBD}`,
    ];
    
    for (let ruta of posiblesRutas) {
        try {
            const existe = await verificarImagenExiste(ruta);
            if (existe) {
                return ruta;
            }
        } catch (error) {
            continue;
        }
    }
    
    return 'https://nftcalendar.io/storage/uploads/2022/02/21/image-not-found_0221202211372462137974b6c1a.png';
}

function obtenerNombreArchivo(ruta) {
    if (!ruta) return '';
    return ruta.split('/').pop().split('\\').pop();
}

async function verificarImagenExiste(url) {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
            console.log('Imagen existe:', url);
            resolve(true);
        };
        
        img.onerror = () => {
            console.log('no existe:', url);
            resolve(false);
        };
        
        setTimeout(() => {
            console.log('No cargo:', url);
            resolve(false);
        }, 3000);
        
        img.src = url;
    });
}

async function obtenerImagenPublicacion(imagenBD) {
    console.log('Cargando imagen:', imagenBD);
    
    const rutaFinal = await detectarRutaImagen(imagenBD);
    console.log('Ruta imagen:', rutaFinal);
    
    return rutaFinal;
}

async function detectarYActualizarImagen(idPublicacion, imagenBD) {
    console.log(`Id publi: ${idPublicacion}, imagen BD: ${imagenBD}`);
    
    try {
        const tipoDetectado = await detectarRutaImagen(imagenBD);
        const urlImagen = construirUrlImagen(idPublicacion, tipoDetectado);
        
        console.log(`URL imagen de publi: ${idPublicacion}: ${urlImagen}`);
        
      
        const imgElement = document.getElementById(`img-${idPublicacion}`);
        const loadingElement = document.getElementById(`loading-${idPublicacion}`);
        const statusElement = document.getElementById(`status-${idPublicacion}`);
        
        console.log('Lo que hay:', {
            img: !!imgElement,
            loading: !!loadingElement,
            status: !!statusElement
        });
        
        if (imgElement) {
          
            imgElement.src = urlImagen;
            
            imgElement.onload = () => {
                console.log(`Imagen lista de publi ${idPublicacion}`);
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                if (statusElement) {
                    statusElement.innerHTML = `Encontrado: <code>${urlImagen}</code>`;
                    statusElement.style.color = '#28a745';
                }
            };
            
            imgElement.onerror = () => {
                console.log(`Error de imagen ${idPublicacion}: ${urlImagen}`);
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                if (statusElement) {
                    statusElement.innerHTML = `Error: <code>${urlImagen}</code>`;
                    statusElement.style.color = '#dc3545';
                }
                imgElement.src = 'https://nftcalendar.io/storage/uploads/2022/02/21/image-not-found_0221202211372462137974b6c1a.png';
            };
        } else {
            console.error(`No se hay img-${idPublicacion}`);
        }
        
    } catch (error) {
        console.error(`Error al checar ${idPublicacion}:`, error);
        
        const loadingElement = document.getElementById(`loading-${idPublicacion}`);
        const statusElement = document.getElementById(`status-${idPublicacion}`);
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (statusElement) {
            statusElement.innerHTML = `Error: ${error.message}`;
            statusElement.style.color = '#dc3545';
        }
    }
}

function debugImagenPublicacion(idPublicacion) {
    console.log(`Debug publi ${idPublicacion}`);
    
    const imgElement = document.getElementById(`img-${idPublicacion}`);
    const statusElement = document.getElementById(`status-${idPublicacion}`);
    
    console.log('Elementos encontrados:', {
        img: imgElement,
        status: statusElement
    });
    
    if (imgElement) {
        console.log('Src actual:', imgElement.src);
        console.log('Alt text:', imgElement.alt);
    }
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    
    try {
        const date = new Date(fecha);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const año = date.getFullYear();
        const hora = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        
        return `${dia}/${mes}/${año} ${hora}:${minutos}`;
    } catch (error) {
        return 'Fecha inválida';
    }
}

async function aprobarPublicacion(idPublicacion) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta publicación?')) return;
    
    const publicacionCard = document.querySelector(`[data-id="${idPublicacion}"]`);
    const btnAprobar = publicacionCard.querySelector('.btn-aprobar');
    const btnRechazar = publicacionCard.querySelector('.btn-rechazar');
    
    btnAprobar.disabled = true;
    btnRechazar.disabled = true;
    btnAprobar.textContent = 'Aprobando...';
    
    try {
        const response = await fetch('Public/php/api_admin_new.php?endpoint=aprobar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_publicacion: idPublicacion
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            publicacionCard.style.backgroundColor = '#d4edda';
            publicacionCard.style.border = '2px solid #28a745';
            
            setTimeout(() => {
                publicacionCard.remove();
            }, 1500);
            
            alert('Publi aprobada');
            
            const remainingCards = document.querySelectorAll('.publicacion-pendiente');
            if (remainingCards.length <= 1) {
                setTimeout(() => {
                    cargarPublicacionesPendientes();
                }, 2000);
            }
            
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error aprobando:', error);
        alert('Error al aprobar: ' + error.message);
        
        btnAprobar.disabled = false;
        btnRechazar.disabled = false;
        btnAprobar.textContent = 'Aprobar';
    }
}

async function rechazarPublicacion(idPublicacion) {
    if (!confirm('¿Estás seguro de que quieres RECHAZAR y ELIMINAR esta publicación? Esta acción no se puede deshacer.')) return;
    
    const publicacionCard = document.querySelector(`[data-id="${idPublicacion}"]`);
    const btnAprobar = publicacionCard.querySelector('.btn-aprobar');
    const btnRechazar = publicacionCard.querySelector('.btn-rechazar');
    
    btnAprobar.disabled = true;
    btnRechazar.disabled = true;
    btnRechazar.textContent = ' Rechazando...';
    
    try {
        const response = await fetch('Public/php/api_admin_new.php?endpoint=rechazar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_publicacion: idPublicacion
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            publicacionCard.style.backgroundColor = '#f8d7da';
            publicacionCard.style.border = '2px solid #dc3545';
            
            setTimeout(() => {
                publicacionCard.remove();
            }, 1500);
            
            alert('Publi rechazada y eliminada');
            
            const remainingCards = document.querySelectorAll('.publicaciones-pendiente');
            if (remainingCards.length <= 1) {
                setTimeout(() => {
                    cargarPublicacionesPendientes();
                }, 2000);
            }
            
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error rechazando :', error);
        alert('Error al rechazar: ' + error.message);
        
        btnAprobar.disabled = false;
        btnRechazar.disabled = false;
        btnRechazar.textContent = 'Rechazar';
    }
}

function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}

function toggleDarkMode(checkbox) {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        checkbox.checked = true;
    } else {
        localStorage.setItem("theme", "light");
        checkbox.checked = false;
    }
}

document.getElementById('mundial-form').onsubmit = async function(e) {
    e.preventDefault();
    const paismundial = document.getElementById('paismundial').value.trim();
    const sede = document.getElementById('sede').value.trim();
    const year = document.getElementById('year').value;
    const imagen_mundial = document.getElementById('imagen_mundial').value.trim();
    const resena_mundial = document.getElementById('resena_mundial').value.trim();
    if (!paismundial || !sede || !year) return alert('Completa todos los campos obligatorios');
    const res = await fetch('Public/php/api_mundial_edicion.php?endpoint=crear_mundial', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({paismundial, sede, year, imagen_mundial, resena_mundial})
    });
    const data = await res.json();
    if (data.status === 'success') {
        this.reset();
        cargarMundiales();
    } else {
        alert('No se pudo crear');
    }
};

async function cargarMundiales() {
    const grid = document.getElementById('mundiales-grid');
    grid.innerHTML = '<div>Cargando...</div>';
    const res = await fetch('Public/php/api_mundial_edicion.php?endpoint=mundiales');
    const data = await res.json();
    grid.innerHTML = '';
    if (data.status === 'success') {
        data.data.forEach(m => {
            const div = document.createElement('div');
            div.className = 'mundial-card';
            div.innerHTML = `
                <img src="${m.imagen_mundial || 'Imagenes/default-mundial.jpg'}" alt="${m.paismundial}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
                <div>
                  <strong>${m.paismundial}</strong> (${m.Sede})<br>
                  <span>${m.Year_Mundial ? m.Year_Mundial.substring(0,4) : ''}</span>
                  <p>${m.resena_mundial || ''}</p>
                </div>
                <div>
                  <button class="btn-action editpublim" title="Editar publicación" data-id="${m.IDMundial}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action delete" title="Eliminar" onclick="eliminarMundial(${m.IDMundial})">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
            `;
            grid.appendChild(div);
        });
    }
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.editpublim');
    if (btn) {
        const id = btn.getAttribute('data-id');
        editarPublicacion(id);
    }
});
async function editarPublicacion(IDMundial) {
    console.log('ID a editar:', IDMundial);
    document.getElementById('publiEDITModal').style.display = 'block';
    document.getElementById('edit-publication-id').value = IDMundial;

    try {
        const response = await fetch('Public/php/api_mundial_edicion.php?endpoint=mundiales');
        const data = await response.json();

        if (data.status !== 'success') {
            alert('Error cargando publicaciones');
            return;
        }

        const pub = data.data.find(pub => pub.IDMundial == IDMundial);
        if (!pub) {
            alert('No se encontró la publicación');
            return;
        }

       document.getElementById('edit-publication-title').value = pub.paismundial || '';
        document.getElementById('edit-publication-sede').value = pub.Sede || '';
        document.getElementById('edit-publication-description').value = pub.resena_mundial || '';
        document.getElementById('edit-publication-year').value = pub.Year_Mundial ? pub.Year_Mundial.substring(0,10) : '';
        document.getElementById('edit-publication-image').value = pub.imagen_mundial || '';
        document.getElementById('edit-foto-publi').src = pub.imagen_mundial || 'Imagenes/default-mundial.jpg';
        document.getElementById('like-count-modal').textContent = pub.likes || 0;
        document.getElementById('comments-count-modal').textContent = pub.comentarios || 0;

    } catch (error) {
        alert('Error al cargar la publicación para editar');
        console.error(error);
    }
}
window.editarPublicacion = editarPublicacion;


const closePubliEditModal = document.getElementById('publicloseeditModal');
if (closePubliEditModal) {
    closePubliEditModal.onclick = function() {
        document.getElementById('publiEDITModal').style.display = 'none';
    };
}

document.getElementById('btn-guardar-edicion').onclick = async function() {
    const id = document.getElementById('edit-publication-id').value;
    const paismundial = document.getElementById('edit-publication-title').value.trim();
    const sede = document.getElementById('edit-publication-sede').value.trim();
    const year = document.getElementById('edit-publication-year').value;
    const imagen_mundial = document.getElementById('edit-publication-image').value.trim();
    const resena_mundial = document.getElementById('edit-publication-description').value.trim();

    if (!id || !paismundial || !sede || !year) {
        alert('Completa todos los campos obligatorios');
        return;
    }

    await editarMundial(id, paismundial, sede, year, imagen_mundial, resena_mundial);
    document.getElementById('publiEDITModal').style.display = 'none';
};

async function editarMundial(id, paismundial, sede, year, imagen_mundial, resena_mundial) {
    const res = await fetch('Public/php/api_mundial_edicion.php?endpoint=editar_mundial', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, paismundial, sede, year, imagen_mundial, resena_mundial})
    });
    const data = await res.json();
    if (data.status === 'success') {
        cargarMundiales();
    } else {
        alert('No se pudo editar');
    }
}

async function eliminarMundial(id) {
    if (!confirm('¿Eliminar este mundial?')) return;
    const res = await fetch('Public/php/api_mundial_edicion.php?endpoint=eliminar_mundial', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id})
    });
    const data = await res.json();
    if (data.status === 'success') {
        cargarMundiales();
    } else {
        alert('No se pudo eliminar');
    }
}

document.addEventListener('DOMContentLoaded', cargarMundiales);