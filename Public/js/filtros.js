let allPosts = [];
let idMundialActual = null;


async function cargarMundiales() {
  try {
    const response = await fetch('Public/php/api_mundiales.php');
    const result = await response.json();
    if (result.status === 'success') {
      allPosts = result.data;
      renderPosts(allPosts);
    } else {
      document.querySelector('.worldcup-grid').innerHTML = '<p>Error cargando mundiales</p>';
    }
  } catch (error) {
    document.querySelector('.worldcup-grid').innerHTML = '<p>Error de conexión</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarMundiales();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filtrarYOrdenar();
    });
  });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', filtrarYOrdenar);
  }
});

function filtrarYOrdenar() {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const sort = document.getElementById('sortSelect')?.value || 'chronological';

  let filtered = allPosts;
  if (activeFilter !== 'all') {

    const filterParts = activeFilter.split('-');
    if (filterParts.length === 2 && isNaN(filterParts[1])) {
      const pais = capitalize(filterParts[0]);
      const year = filterParts[1];
      filtered = allPosts.filter(pub =>
        pub.country.toLowerCase() === pais.toLowerCase() && pub.year == year
      );
    } else {

      filtered = allPosts.filter(pub => pub.year == activeFilter);
    }
  }


  switch (sort) {
    case 'country':
      filtered.sort((a, b) => a.country.localeCompare(b.country));
      break;
    case 'likes':
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    case 'comments':
       filtered.sort((a, b) => (b.comentarios || 0) - (a.comentarios || 0));
      break;
    default:
      filtered.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }

  renderPosts(filtered);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderPosts(posts) {
  const gridContainer = document.querySelector('.worldcup-grid');
  gridContainer.innerHTML = '';
  if (!posts || posts.length === 0) {
    gridContainer.innerHTML = '<p>No se encontraron mundiales</p>';
    return;
  }

  posts.forEach(pub => {
    const imageUrl = pub.imagem || 'Imagenes/default-post.jpg';
    const div = document.createElement('div');
    div.className = 'worldcup-item';
    div.innerHTML = `
      <div class="worldcup-img-container">
        <img src="${imageUrl}" alt="${pub.country} ${pub.year}" class="worldcup-img">
      </div>
      <div class="worldcup-name">${pub.country} ${pub.year}</div>
    `;
    div.addEventListener('click', () => openModal2(pub));
    gridContainer.appendChild(div);
  });
}

function openModal2(mundial) {
  idMundialActual = mundial.id;

  const modal = document.getElementById('publicationModal');
  if (!modal) return;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    configurarEventListeners();
  }, 100);

  const imageUrl = mundial.imagen_mundial || 'Imagenes/default-post.jpg';

  const modalImg = document.getElementById('publication-modal-image');
  if (modalImg) {
    modalImg.src = imageUrl;
    modalImg.alt = `${mundial.country} ${mundial.year}`;
    document.getElementById('publication-image-container').style.display = 'block';
  }

  document.getElementById('publication-modal-title').textContent = `${mundial.country} ${mundial.year}`;
  document.getElementById('publication-modal-title-full').textContent = `${mundial.country} ${mundial.year}`;
  document.getElementById('publication-description').textContent = mundial.content || 'Sin descripción';

  document.getElementById('publication-author').innerHTML = `Sede: <strong>${mundial.sede || 'No especificada'}</strong>`;
  document.getElementById('publication-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${mundial.year}`;
  document.getElementById('publication-country').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${mundial.country}`;

  document.getElementById('like-count-modal').textContent = mundial.likes || 0;
  document.getElementById('comments-count-modal').textContent = mundial.comentarios || 0;

  document.getElementById('comment-form-container').style.display = 'block';
  cargarComentariosMundial(mundial.id);

  const likeBtn = document.getElementById('like-btn-modal');
  if (likeBtn) {
    likeBtn.onclick = () => toggleLikeMundial(mundial.id);
  }
}

function configurarEventListeners() {
    const modal = document.getElementById('publicationModal');
    const closeBtn = document.getElementById('closePublicationModal');

    if (closeBtn && !closeBtn.dataset.listenerAdded) {
        closeBtn.addEventListener('click', cerrarModalPublicacion2);
        closeBtn.dataset.listenerAdded = "true";
    }

    if (modal && !modal.dataset.listenerAdded) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalPublicacion2();
            }
        });
        modal.dataset.listenerAdded = "true";
    }

    if (!document.body.dataset.escapeListenerAdded) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                cerrarModalPublicacion2();
            }
        });
        document.body.dataset.escapeListenerAdded = "true";
    }
}

function cerrarModalPublicacion2() {
    const modal = document.getElementById('publicationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        idMundialActual = null;    
        const commentsList = document.getElementById('comments-list');
        if (commentsList) commentsList.innerHTML = '';
        const commentText = document.getElementById('comment-text');
        if (commentText) commentText.value = '';
        const noComments = document.getElementById('no-comments');
        if (noComments) noComments.style.display = 'none';
    }
}

async function toggleLikeMundial(idMundial) {
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
    const response = await fetch('Public/php/api_likes_mundial.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: isActive ? 'remove' : 'add',
        correo: usuario.correo || usuario.email,
        id_mundial: idMundial
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
    alert('Error al actualizar like: ' + error.message);
  }
}

async function cargarComentariosMundial(idMundial) {
  const commentsList = document.getElementById('comments-list');
  const noComments = document.getElementById('no-comments');
  if (!commentsList) return;
  try {
    const response = await fetch(`Public/php/api_com_mundial.php?id_mundial=${idMundial}`);
    const data = await response.json();
    if (data.status === 'success') {
      if (data.data && data.data.length > 0) {
        mostrarComentariosMundial(data.data);
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
    commentsList.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--muted);">Error cargando comentarios: ${error.message}</div>`;
  }
}

function mostrarComentariosMundial(comentarios) {
  const commentsList = document.getElementById('comments-list');
  if (!commentsList) return;
  const usuario = obtenerUsuarioActual();
  const html = comentarios.map(comentario => {
    const esAutorComentario = usuario && (usuario.correo === comentario.correo || usuario.email === comentario.correo);
    return `
      <div class="comment-item" data-comment-id="${comentario.id_comentario}">
        <div class="comment-header">
          <span class="comment-author">${comentario.nombre_completo || comentario.correo}</span>
          <span class="comment-date">${comentario.fecha_comentario}</span>
        </div>
        <div class="comment-content">${comentario.contenido}</div>
        ${esAutorComentario ? `
          <div class="comment-actions">
            <button class="btn-delete-comment" onclick="eliminarComentarioMundial(${comentario.id_comentario})" title="Eliminar comentario">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  commentsList.innerHTML = html;
}

document.getElementById('comment-form').addEventListener('submit', enviarComentarioMundial);

async function enviarComentarioMundial(e) {
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
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  try {
    const idMundial = idMundialActual;
    const response = await fetch('Public/php/api_com_mundial.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_mundial: idMundial,
        contenido: contenido,
        correo: usuario.correo || usuario.email
      })
    });
    const data = await response.json();
    if (data.status === 'success') {
      commentText.value = '';
      cargarComentariosMundial(idMundial);
    } else {
      throw new Error(data.message || 'Error comentario');
    }
  } catch (error) {
    alert('Error comentario: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    commentText.focus();
  }
}

async function eliminarComentarioMundial(idComentario) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    alert('Debes iniciar sesión para realizar esta acción');
    return;
  }
  if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
    return;
  }
  try {
    const response = await fetch('Public/php/api_com_mundial.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_comentario: idComentario,
        correo: usuario.correo || usuario.email
      })
    });
    const data = await response.json();
    if (data.status === 'success') {
      cargarComentariosMundial(idMundialActual);
    } else {
      throw new Error(data.message || 'Error eliminando comentario');
    }
  } catch (error) {
    alert('Error eliminando comentario: ' + error.message);
  }
}

function obtenerUsuarioActual() {
    const correo = localStorage.getItem('userEmail') || localStorage.getItem('correo');
    const email = localStorage.getItem('userEmail');
    const nombre_completo = localStorage.getItem('userName');
    if (correo || email) {
        return {
            correo: correo || email,
            email: email,
            nombre_completo: nombre_completo
        };
    }
    return null;
}

