
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const createPostBtn = document.getElementById('createPostBtn');
  const registerLink = document.getElementById('registerLink');
  
  loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });
  
  closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Inicio de sesión exitoso!');
    loginModal.style.display = 'none';
  });
  
  createPostBtn.addEventListener('click', () => {
    const isLoggedIn = false; 
    
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para crear una publicación');
      loginModal.style.display = 'flex';
    } else {
      window.location.href = 'crear-publicacion.html';
    }
  });
  
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirigiendo al formulario de registro...');
    window.location.href = 'registro.html';
  });
  
  const filters = document.querySelectorAll('.filter');
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
    });
  });
  
  const sortSelect = document.querySelector('.sort-select');
  sortSelect.addEventListener('change', () => {
    console.log('Ordenar por:', sortSelect.value);
  });

  function showGroup(groupNumber) {
      document.querySelectorAll('.worldcup-grid').forEach(group => {
          group.style.display = 'none';
      });

      const selectedGroup = document.getElementById('group' + groupNumber);
      if (selectedGroup) {
          selectedGroup.style.display = 'grid';
      }
  }

document.getElementById('create-post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const worldcup = document.getElementById('post-worldcup').value;
    const country = document.getElementById('post-country').value;
    
    const mediaFile = document.getElementById('post-media').files[0];
    

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Debes iniciar sesión para crear una publicación');
        return;
    }
    
    const publication = {
        id: Date.now(),
        title,
        content,
        category,
        worldcup,
        country,
        author: user.username,
        authorId: user.id,
        status: 'pending', 
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    
    if (mediaFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            publication.media = {
                data: e.target.result,
                type: mediaFile.type.includes('image') ? 'image' : 'video',
                name: mediaFile.name
            };
            
            savePublication(publication);
        };
        reader.readAsDataURL(mediaFile);
    } else {
        savePublication(publication);
    }
});

function savePublication(publication) {

    let pendientes = JSON.parse(localStorage.getItem('publicacionesPendientes')) || [];
    pendientes.push(publication);
    localStorage.setItem('publicacionesPendientes', JSON.stringify(pendientes));

    document.getElementById('createModal').style.display = 'none';
    alert('¡Publicación creada! Esperando aprobación del administrador.');
    
    document.getElementById('create-post-form').reset();
}

function loadApprovedPublications() {
    const approvedPublications = JSON.parse(localStorage.getItem('publicacionesAprobadas')) || [];
    
    if (approvedPublications.length === 0) {
        console.log('No hay publicaciones aprobadas aún');
        return;
    }

    const contenedor = document.getElementById('contenedor-publicaciones');
    let html = '';

    approvedPublications.forEach(pub => {
        html += `
          <div class="publicacion">
            <h3>${pub.title}</h3>
            <p><strong>${pub.author}</strong> - ${new Date(pub.createdAt).toLocaleString()}</p>
            <p>${pub.content}</p>
          </div>
        `;
    });

    contenedor.innerHTML = html;
}


document.addEventListener('DOMContentLoaded', loadApprovedPublications);