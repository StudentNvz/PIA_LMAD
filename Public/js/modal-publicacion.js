let publicacionActual = null;

document.addEventListener('DOMContentLoaded', () => {
    
    const modal = document.getElementById('publicationModal');
    if (!modal) {
        console.error('Modal publicationModal no encontrado en el DOM');
        return;
    }
    
    setTimeout(() => {
        configurarEventListeners();
    }, 100);
});

function configurarEventListeners() {
    const modal = document.getElementById('publicationModal');
    const closeBtn = document.getElementById('closePublicationModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModalPublicacion);
    } else {
        console.warn('Botón cerrar modal no encontrado');
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalPublicacion();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            cerrarModalPublicacion();
        }
    });
    console.log('Event listener Escape agregado');
}

async function abrirModalPublicacion(idPublicacion) {
    console.log('Abriendo modal para publicación:', idPublicacion);
    
    const modal = document.getElementById('publicationModal');
    if (!modal) {
        alert('Error: Modal no disponible');
        return;
    }
    

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const modalBody = modal.querySelector('.publication-modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="publication-content">
                <div class="publication-image-container" id="publication-image-container" style="display: none;">
                    <img id="publication-modal-image" src="" alt="Imagen de publicación">
                </div>
                
                <div class="publication-info">
                    <h3 id="publication-modal-title-full">Cargando...</h3>
                    
                    <div class="publication-meta">
                        <span class="publication-author" id="publication-author">Por: <strong>Cargando...</strong></span>
                        <span class="publication-date" id="publication-date"> <i class="fas fa-calendar-alt"></i>  Cargando...</span>
                        <span class="publication-country" id="publication-country"> <i class="fas fa-map-marker-alt"></i> Cargando...</span>
                        <span id="publication-mundial"><strong>Mundial:</strong> Cargando...</span>
                        <span id="publication-categoria"><strong>Categoría:</strong> Cargando...</span>
          
                        </div>
                     
                    <div class="publication-description" id="publication-description">Cargando descripción...</div>
                    
                    <div class="publication-actions">
                        <button class="action-btn like-btn-modal" id="like-btn-modal" title="Me gusta">
                            <i class="fas fa-thumbs-up"></i>
                            <span class="count" id="like-count-modal">0</span>
                        </button>
                        
                        <button class="action-btn favorite-btn-modal" id="favorite-btn-modal" title="Agregar a favoritos">
                            <i class="fas fa-star"></i>
                        </button>
                        
                        <span class="comments-count">
                            <i class="fas fa-comments"></i>
                            <span id="comments-count-modal">0</span> comentarios
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="comments-section">
                <h4> <i class="fas fa-comments"></i> Comentarios</h4>
                
                <div class="comment-form" id="comment-form-container">
                    <form id="comment-form">
                        <div class="comment-input-group">
                            <textarea id="comment-text" 
                                      placeholder="Escribe tu comentario..." 
                                      rows="3" 
                                      maxlength="500" 
                                      required></textarea>
                            <div class="comment-form-actions">
                                <span class="char-count" id="char-count">0/500</span>
                                <button type="submit" class="btn-comment-submit" id="btn-comment-submit">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="comments-list" id="comments-list">
                    <div class="comments-loading">Cargando comentarios...</div>
                </div>
                
                <div class="no-comments" id="no-comments" style="display: none;">
                    <p>Sé el primero en comentar esta publicación</p>
                </div>
            </div>
        `;
    }
    
    setTimeout(() => {
        configurarFormularioComentarios();
    }, 50);
    
    try {

        await cargarDatosPublicacion(idPublicacion);
        
        await cargarComentarios(idPublicacion);
        
        publicacionActual = idPublicacion;
        
        console.log('Modal configurado completamente');
        
    } catch (error) {
        console.error('Error cargando publicación:', error);
        mostrarErrorPublicacion(error.message);
    }
}


async function cargarDatosPublicacion(idPublicacion) {
    try {

        const response = await fetch(`Public/php/api_publi_new.php?endpoint=todas&limite=100`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error('Error cargando publicaciones');
        }

        const publicacion = data.data.find(pub => pub.id_publicacion == idPublicacion);
        
        if (!publicacion) {
            throw new Error('Publicación no encontrada');
        }
        
        
     await esperarElementos([
    'publication-modal-title-full',
    'publication-description',
    'publication-author',
    'publication-date',
    'publication-country',
    'like-count-modal',
    'comments-count-modal',
    'publication-image-container',
    'publication-modal-image',
    'publication-mundial',
    'publication-categoria'
]);
        
        document.getElementById('publication-modal-title').textContent = publicacion.titulo || 'Sin título';
        document.getElementById('publication-modal-title-full').textContent = publicacion.titulo || 'Sin título';
        document.getElementById('publication-description').textContent = publicacion.contenido || 'Sin descripción';
        
        document.getElementById('publication-author').innerHTML = `Por: <strong>${publicacion.correo || 'Anónimo'}</strong>`;
        document.getElementById('publication-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatearFecha(publicacion.fechahora_publicacion)}`;
        document.getElementById('publication-country').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${publicacion.pais_publicacion || 'No especificado'}`;
       const mundialElem = document.getElementById('publication-mundial');
if (mundialElem) {
    const mundial = publicacion.mundial || '';
    const year = publicacion.year || publicacion.Year_Mundial || '';
    let texto = 'Sin mundial';
    if (mundial && year) {
        texto = `${mundial} ${year}`;
    } else if (mundial) {
        texto = mundial;
    } else if (year) {
        texto = year;
    }
    mundialElem.innerHTML = `<strong>Mundial:</strong> ${texto}`;
}

const categoriaElem = document.getElementById('publication-categoria');
if (categoriaElem) {
    categoriaElem.innerHTML = `<strong>Categoría:</strong> ${publicacion.categoria || 'Sin categoría'}`;
}
        document.getElementById('like-count-modal').textContent = publicacion.likes || 0;
        document.getElementById('comments-count-modal').textContent = publicacion.comentarios || 0;
        
        await cargarImagenPublicacion(publicacion);
        
        configurarBotonesAccion(publicacion);
    
        
    } catch (error) {
        throw error;
    }
}

async function esperarElementos(ids, maxIntentos = 10) {
    for (let intento = 0; intento < maxIntentos; intento++) {
        let todosEncontrados = true;
        
        for (const id of ids) {
            if (!document.getElementById(id)) {
                todosEncontrados = false;
                break;
            }
        }
        
        if (todosEncontrados) {
            console.log(`Todos los elementos encontrados en intento ${intento + 1}`);
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.warn('No se pudieron encontrar todos los elementos después de', maxIntentos, 'intentos');
}

async function cargarImagenPublicacion(publicacion) {
    const imageContainer = document.getElementById('publication-image-container');
    const modalImage = document.getElementById('publication-modal-image');
    
    if (!imageContainer || !modalImage) return;
    
    try {
        let imagenSrc = '';
        
        if (publicacion.tiene_imagen_blob && publicacion.imagen_blob_url) {
            imagenSrc = publicacion.imagen_blob_url;
        } else {
            imagenSrc = 'Imagenes/Logo1.png';
        }
        
        modalImage.src = imagenSrc;
        modalImage.style.display = 'block';
        
        modalImage.onload = () => {
            imageContainer.style.display = 'block';        
        };
        
        modalImage.onerror = () => {
            modalImage.src = 'Imagenes/Logo1.png';
            imageContainer.style.display = 'block';
        };
        
    } catch (error) {
        console.error('Error cargando imagen:', error);
        modalImage.src = 'Imagenes/Logo1.png';
    }
}

function configurarBotonesAccion(publicacion) {
    const likeBtn = document.getElementById('like-btn-modal');
    const favoriteBtn = document.getElementById('favorite-btn-modal');
    
    if (likeBtn) {
        likeBtn.onclick = () => toggleLikeModal(publicacion.id_publicacion);
    }
    
    if (favoriteBtn) {
        favoriteBtn.onclick = () => toggleFavoritoModal(publicacion.id_publicacion);
    }
    
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        cargarEstadosModalUsuario(usuario.correo || usuario.email, publicacion.id_publicacion);
    }
}

async function cargarEstadosModalUsuario(correoUsuario, idPublicacion) {
    try {
        const likesResponse = await fetch(`Public/php/api_likes.php?action=getUserLikes&correo=${encodeURIComponent(correoUsuario)}`);
        if (likesResponse.ok) {
            const likesData = await likesResponse.json();
            if (likesData.status === 'success' && likesData.data) {
                const hasLike = likesData.data.some(like => like.id_publicacion == idPublicacion);
                const likeBtn = document.getElementById('like-btn-modal');
                if (likeBtn && hasLike) {
                    likeBtn.classList.add('active');
                }
            }
        }
        
        const favResponse = await fetch(`Public/php/api_favoritos.php?action=getUserFavorites&correo=${encodeURIComponent(correoUsuario)}`);
        if (favResponse.ok) {
            const favData = await favResponse.json();
            if (favData.status === 'success' && favData.data) {
                const hasFavorite = favData.data.some(fav => fav.id_publicacion == idPublicacion);
                const favBtn = document.getElementById('favorite-btn-modal');
                if (favBtn && hasFavorite) {
                    favBtn.classList.add('active');
                }
            }
        }
        
    } catch (error) {
        console.log('No se pudieron cargar los estados del usuario:', error.message);
    }
}

async function cargarComentarios(idPublicacion) {
    const commentsList = document.getElementById('comments-list');
    const noComments = document.getElementById('no-comments');
    
    if (!commentsList) return;
    
    try {
        console.log('Cargando comentarios:', idPublicacion);
        
        const response = await fetch(`Public/php/api_com.php?id_publicacion=${idPublicacion}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            if (data.data && data.data.length > 0) {
                mostrarComentarios(data.data);
                if (noComments) noComments.style.display = 'none';
            } else {
                commentsList.innerHTML = '';
                if (noComments) noComments.style.display = 'block';
            }
            
            const commentsCountElement = document.getElementById('comments-count-modal');
            if (commentsCountElement) {
                commentsCountElement.textContent = data.total;
            }
            
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        commentsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--muted);">
                Error cargando comentarios: ${error.message}
                <br><br>
            </div>
        `;
    }
}

function mostrarComentarios(comentarios) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    const usuario = obtenerUsuarioActual();
    
    const html = comentarios.map(comentario => {
        const esAutorComentario = usuario && (usuario.correo === comentario.correo || usuario.email === comentario.correo);
        const esAutorPublicacion = usuario && (usuario.correo === comentario.autor_publicacion || usuario.email === comentario.autor_publicacion);
        const puedeEliminar = esAutorComentario || esAutorPublicacion;
        
        const fecha = formatearFecha(comentario.fecha_comentario);
        
        return `
            <div class="comment-item" data-comment-id="${comentario.id_comentario}">
                <div class="comment-header">
                    <div>
                        <span class="comment-author">${comentario.nombre_completo || comentario.correo}</span>
                        ${esAutorPublicacion ? '<span class="comment-author-badge">Autor</span>' : ''}
                    </div>
                    <span class="comment-date">${fecha}</span>
                </div>
                <div class="comment-content">${comentario.contenido}</div>
                ${puedeEliminar ? `
                    <div class="comment-actions">
                        <button class="btn-delete-comment" onclick="eliminarComentario(${comentario.id_comentario})" title="Eliminar comentario">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    commentsList.innerHTML = html;
}

function configurarFormularioComentarios() {
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const charCount = document.getElementById('char-count');
    
    if (commentText && charCount) {
        commentText.addEventListener('input', () => {
            const length = commentText.value.length;
            charCount.textContent = `${length}/500`;
            
            if (length > 450) {
                charCount.style.color = '#dc3545';
            } else if (length > 400) {
                charCount.style.color = '#ffc107';
            } else {
                charCount.style.color = 'var(--muted)';
            }
        });
    }
    
    if (commentForm) {
        commentForm.addEventListener('submit', enviarComentario);
    }
    
    // Verificar si el usuario está logueado
    const usuario = obtenerUsuarioActual();
    const formContainer = document.getElementById('comment-form-container');
    
    if (!usuario && formContainer) {
        formContainer.innerHTML = `
            <div class="comment-login-required">
                <p>Debes iniciar sesión para comentar</p>
                <button class="btn-login-redirect" onclick="window.location.href='login.html'">
                    <i class="fas fa-sign-in-alt"></i>
                    Iniciar Sesión
                </button>
            </div>
        `;
    }
}

async function enviarComentario(e) {
    e.preventDefault();
    
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        alert('Debes iniciar sesión para comentar');
        return;
    }
    
    const commentText = document.getElementById('comment-text');
    const submitBtn = document.getElementById('btn-comment-submit');
    
    if (!commentText || !submitBtn) return;
    
    const contenido = commentText.value.trim();
    
    if (contenido.length === 0) {
    alert('El comentario no puede estar vacío');
    commentText.focus();
    return;
}
    
    commentText.disabled = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        const response = await fetch('Public/php/api_com.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_publicacion: publicacionActual,
                contenido: contenido,
                correo: usuario.correo || usuario.email
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            commentText.value = '';
            const charCount = document.getElementById('char-count');
            if (charCount) {
                charCount.textContent = '0/500';
            }
            
            await cargarComentarios(publicacionActual);
            
            const commentsCountElement = document.getElementById('comments-count-modal');
            if (commentsCountElement) {
                const currentCount = parseInt(commentsCountElement.textContent) || 0;
                commentsCountElement.textContent = currentCount + 1;
            }
            
            console.log('Comentario enviado');
            
        } else {
            throw new Error(data.message || 'Error comentario');
        }
        
    } catch (error) {
        alert('Error comentario: ' + error.message);
    } finally {
        commentText.disabled = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        commentText.focus();
    }
}

async function eliminarComentario(idComentario) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        alert('Debes iniciar sesión para realizar esta acción');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        return;
    }
    
    try {
        const response = await fetch('Public/php/api_com.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_comentario: idComentario,
                correo: usuario.correo || usuario.email
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            await cargarComentarios(publicacionActual);
            
            const commentsCountElement = document.getElementById('comments-count-modal');
            if (commentsCountElement) {
                const currentCount = parseInt(commentsCountElement.textContent) || 0;
                commentsCountElement.textContent = Math.max(0, currentCount - 1);
            }  
        } else {
            throw new Error(data.message || 'Error eliminando comentario');
        }
        
    } catch (error) {
        console.error('Error eliminando comentario:', error);
        alert('Error eliminando comentario: ' + error.message);
    }
}

async function toggleLikeModal(idPublicacion) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        mostrarLoginRequerido();
        return;
    }
    
    const likeBtn = document.getElementById('like-btn-modal');
    const countSpan = document.getElementById('like-count-modal');
    
    if (!likeBtn || !countSpan) return;
    
    try {
        const isActive = likeBtn.classList.contains('active');
        
        const response = await fetch('Public/php/api_likes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: isActive ? 'remove' : 'add',
                correo: usuario.correo || usuario.email,
                id_publicacion: idPublicacion
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            likeBtn.classList.toggle('active');
            const currentCount = parseInt(countSpan.textContent) || 0;
            countSpan.textContent = isActive ? Math.max(0, currentCount - 1) : currentCount + 1;
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error toggle like modal:', error);
        likeBtn.classList.toggle('active');
        const currentCount = parseInt(countSpan.textContent) || 0;
        const isActive = likeBtn.classList.contains('active');
        countSpan.textContent = isActive ? currentCount + 1 : Math.max(0, currentCount - 1);
    }
}

async function toggleFavoritoModal(idPublicacion) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        mostrarLoginRequerido();
        return;
    }
    
    const favoriteBtn = document.getElementById('favorite-btn-modal');
    
    if (!favoriteBtn) return;
    
    try {
        const isActive = favoriteBtn.classList.contains('active');
        
        const response = await fetch('Public/php/api_favoritos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: isActive ? 'remove' : 'add',
                correo: usuario.correo || usuario.email,
                id_publicacion: idPublicacion
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            favoriteBtn.classList.toggle('active');
        } else {
            throw new Error(data.message);
        }
        
    } catch (error) {
        console.error('Error toggle favorito modal:', error);
        favoriteBtn.classList.toggle('active');
    }
}

function cerrarModalPublicacion() {
    const modal = document.getElementById('publicationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        publicacionActual = null;
        
        const modalBody = modal.querySelector('.publication-modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
        }
    }
}

function mostrarLoadingPublicacion() {
    const modalBody = document.querySelector('.publication-modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--brand-primary); margin-bottom: 1rem;"></i>
                <p style="color: var(--muted); font-size: 1.1rem;">Cargando publicación...</p>
            </div>
        `;
    }
}

function mostrarErrorPublicacion(mensaje) {
    const modalBody = document.querySelector('.publication-modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-color2); margin-bottom: 1rem;">Error cargando publicación</h3>
                <p style="color: var(--muted); margin-bottom: 2rem;">${mensaje}</p>
                <button onclick="cerrarModalPublicacion()" style="padding: 0.75rem 1.5rem; background: var(--brand-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Cerrar
                </button>
            </div>
        `;
    }
}

function obtenerUsuarioActual() {
    try {
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
        const hora = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        
        return `${dia}/${mes}/${año} ${hora}:${minutos}`;
    } catch (error) {
        return 'Fecha inválida';
    }
}

function mostrarLoginRequerido() {
    if (confirm('Debes iniciar sesión para interactuar con las publicaciones. ¿Quieres ir a la página de login?')) {
        window.location.href = 'login.html';
    }
}

