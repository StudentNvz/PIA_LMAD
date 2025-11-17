const createModal = document.getElementById('createModal');
const createPostForm = document.getElementById('create-post-form');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.btn-cancel');

function isUserLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function getUserEmail() {
    return localStorage.getItem("userEmail") || '';
}

function getUserName() {
    return localStorage.getItem("userName") || '';
}

function openModal() {
    console.log('ABriendo el modal...');
    
    if (!isUserLoggedIn()) {
        alert('Debes iniciar sesión para crear publicaciones');
        window.location.href = 'login.html';
        return;
    }
    
    if (createModal) {
        createModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal abierto');
    } else {
        console.error('Modal no encontrado');
    }
}

function closeModal() {
    console.log('Cerrando modal...');
    if (createModal) {
        createModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        if (createPostForm) {
            createPostForm.reset();
        }
        console.log('cerrado y limpio');
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', openModal);
    } else {
        console.error('Btn crear publi no encontrado');
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (createModal) {
        createModal.addEventListener('click', (e) => {
            if (e.target === createModal) {
                closeModal();
            }
        });
    }
    
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Enviando formulario de publicación...');
            
            if (!isUserLoggedIn()) {
                alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
                window.location.href = 'login.html';
                return;
            }

            const formData = new FormData();
            
            const userEmail = getUserEmail();
            const userName = getUserName();
            
            if (!userEmail) {
                alert('No se pudo obtener la información del usuario');
                return;
            }

            const title = document.getElementById('post-title')?.value.trim();
            const content = document.getElementById('post-content')?.value.trim();
            const category = document.getElementById('post-category')?.value;
            const worldcup = document.getElementById('post-worldcup')?.value;
            const country = document.getElementById('post-country')?.value.trim() || 'No especificado';
            let mediaFile = document.getElementById('post-media')?.files[0];

            if (!title || !content || !category || !worldcup) {
                alert('Por favor, completa todos los campos obligatorios');
                return;
            }

            if (!mediaFile) {
                alert('Por favor, selecciona una imagen o video');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
            if (!allowedTypes.includes(mediaFile.type)) {
                alert('Tipo de archivo no permitido. Solo JPG, PNG, GIF, MP4, AVI, MOV');
                return;
            }
            const minSize = 50 * 1024; // 50KB min
            const maxSize = 16 * 1024 * 1024; // 3MB max
            const optimalMaxSize = 1.5 * 1024 * 1024; // 1.5MB 

            if (mediaFile.size < minSize) {
                alert('El archivo pequeño. Min 50KB para asegurar buena calidad');
                return;
            }

            if (mediaFile.size > maxSize) {
                alert('El archivo es demasiado grande. Máximo 16MB');
                return;
            }

            if (mediaFile.size > optimalMaxSize) {
                const shouldContinue = confirm(
                    `El archivo pesa ${(mediaFile.size / 1024 / 1024).toFixed(2)}MB\n\n` +
                    `Para mejor rendimiento recomendamos máximo 1.5MB\n\n` +
                    `¿Deseas continuar de todas formas?`
                );
                if (!shouldContinue) {
                    return;
                }
            }

            if (mediaFile.type.startsWith('image/')) {
                await validarDimensionesImagen(mediaFile);
            }

            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('worldcup', worldcup);
            formData.append('country', country);
            formData.append('media', mediaFile);
            formData.append('email', userEmail);
            formData.append('author', userName);

            console.log('Datos a enviar:', {
                title, content, category, worldcup, country,
                fileName: mediaFile.name,
                fileSize: mediaFile.size,
                email: userEmail,
                author: userName
            });

            const submitBtn = createPostForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Publicando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('Public/php/create_post.php', {
                    method: 'POST',
                    body: formData
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                console.log('Response text:', text);

                let result;
                try {
                    result = JSON.parse(text);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    throw new Error('Respuesta del servidor no válida');
                }

                console.log('Respuesta del servidor:', result);

                if (result.status === 'success') {
                    const mediaInfo = result.data.media_size_kb ? 
                        `\nTamaño guardado: ${result.data.media_size_kb} KB` : '';
                    
                    alert('¡Publicación creada exitosamente!' + 
                          '\n\nID: ' + result.data.id_publicacion +
                          '\n\nEstará visible una vez que sea aprobada por un administrador.');
                    closeModal();
                    
                } else {
                    alert('Error: ' + (result.message || 'Error desconocido'));
                }

            } catch (error) {
                console.error('Error enviando publicación:', error);
                alert('Error al enviar la publicación:\n' + error.message + '\n\nVerifica tu conexión e intenta nuevamente.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
    } else {
        console.error('Formulario de crear publicación no encontrado');
    }
});

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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && createModal?.style.display === 'block') {
        closeModal();
    }
});

async function validarDimensionesImagen(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            const width = img.width;
            const height = img.height;
            const aspectRatio = width / height;
            
            console.log(`Dimensiones de imagen: ${width}x${height}`);
            
            if (width < 200 || height < 200) {
                alert(`Imagen muy pequeña: ${width}x${height}\n\nMínimo recomendado: 200x200 píxeles`);
                reject(new Error('Imagen muy pequeña'));
                return;
            }
            
            if (width > 4000 || height > 4000) {
                const shouldContinue = confirm(
                    `Imagen muy grande: ${width}x${height}\n\n` +
                    `Para mejor rendimiento recomendamos máximo 2000x2000\n\n` +
                    `¿Continuar de todas formas?`
                );
                if (!shouldContinue) {
                    reject(new Error('Imagen muy grande'));
                    return;
                }
            }
            
            resolve();
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo cargar la imagen'));
        };
        
        img.src = url;
    });
}

async function comprimirImagen(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
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
                
                console.log(`Compresión: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
            }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

function mostrarPreviewArchivo(file) {
    const previewContainer = document.getElementById('file-preview') || crearPreviewContainer();
    
    const sizeKB = (file.size / 1024).toFixed(2);
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    let sizeClass = 'optimal';
    let sizeMessage = 'Tamaño óptimo';
    
    if (file.size < 50 * 1024) {
        sizeClass = 'too-small';
        sizeMessage = 'Muy pequeño (puede verse pixelado)';
    } else if (file.size > 1.5 * 1024 * 1024) {
        sizeClass = 'large';
        sizeMessage = 'Grande (carga lenta)';
    } else if (file.size > 3 * 1024 * 1024) {
        sizeClass = 'too-large';
        sizeMessage = 'Demasiado grande';
    }
    
    previewContainer.innerHTML = `
        <div class="file-info ${sizeClass}">
            <div class="file-preview">
                ${file.type.startsWith('image/') ? 
                    `<img src="${URL.createObjectURL(file)}" alt="Preview" style="max-width: 200px; max-height: 150px;">` :
                    `<div class="video-preview"> ${file.name}</div>`
                }
            </div>
            <div class="file-details">
                <p><strong>Archivo:</strong> ${file.name}</p>
                <p><strong>Tamaño:</strong> ${sizeMB}MB (${sizeKB}KB)</p>
                <p><strong>Tipo:</strong> ${file.type}</p>
                <p class="size-message">${sizeMessage}</p>
            </div>
        </div>
    `;
}

function crearPreviewContainer() {
    const container = document.createElement('div');
    container.id = 'file-preview';
    container.style.margin = '10px 0';
    
    const mediaInput = document.getElementById('post-media');
    mediaInput.parentNode.appendChild(container);
    
    return container;
}

document.getElementById('post-media').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        mostrarPreviewArchivo(e.target.files[0]);
    }
});
