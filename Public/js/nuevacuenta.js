function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const body = document.body;
    const iconLight = themeToggle.querySelector('.icon-light');
    const iconDark = themeToggle.querySelector('.icon-dark');

    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        if (iconLight) iconLight.style.display = 'none';
        if (iconDark) iconDark.style.display = 'inline';
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        if (iconLight) iconLight.style.display = 'inline';
        if (iconDark) iconDark.style.display = 'none';
        themeToggle.setAttribute('aria-pressed', 'false');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        if (isDark) {
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'inline';
            themeToggle.setAttribute('aria-pressed', 'true');
            localStorage.setItem('theme', 'dark');
        } else {
            if (iconLight) iconLight.style.display = 'inline';
            if (iconDark) iconDark.style.display = 'none';
            themeToggle.setAttribute('aria-pressed', 'false');
            localStorage.setItem('theme', 'light');
        }
    });
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

function enhanceErrorAccessibility(input, errorElement) {
    input.setAttribute('aria-describedby', errorElement.id);
    input.setAttribute('aria-invalid', 'false');

    input.addEventListener('blur', () => {
        if (input.classList.contains('invalid')) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.setAttribute('aria-invalid', 'false');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    
    initializeThemeSwitcher();


    const checkbox = document.getElementById("toggleTheme");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (checkbox) checkbox.checked = true;
    }

    const form = document.getElementById('registerForm');
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    const nombre = document.getElementById('nombreCompleto');
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    const password = document.getElementById('password');
    const email = document.getElementById('email');


    function setupErrorMessages() {
        function createErrorElement(inputElement) {
            if (!inputElement) return null;
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.id = `${inputElement.id}-error`;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            enhanceErrorAccessibility(inputElement, errorElement);
            return errorElement;
        }
        
        if (password) createErrorElement(password);
        if (email) createErrorElement(email);
        if (fechaNacimiento) createErrorElement(fechaNacimiento);
    }
    
    setupErrorMessages();

    function validatePassword() {
        const value = this.value;
        const errorElement = this.nextElementSibling;
        if (!errorElement) return;
        
        let errors = [];

        if (value.length < 8) errors.push("Mínimo 8 caracteres");
        if (!/[a-z]/.test(value)) errors.push("Al menos una minúscula");
        if (!/[A-Z]/.test(value)) errors.push("Al menos una mayúscula");
        if (!/\d/.test(value)) errors.push("Al menos un número");
        if (!/[!@#$%^&*(),.?:{}|<>_\-+=~`]/.test(value)) errors.push("Al menos un símbolo !@#$%^&*(),.?:{}|<>_\-+=~`");


        if (errors.length > 0 && value.length > 0) {
            errorElement.innerHTML = '<ul><li>' + errors.join('</li><li>') + '</li></ul>';
            this.classList.add('invalid');
        } else {
            errorElement.innerHTML = '';
            this.classList.remove('invalid');
        }
    }

    function validateEmail() {
        const value = this.value.trim();
        const errorElement = this.nextElementSibling;
        if (!errorElement) return;
        
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value) && value.length > 0) {
            errorElement.textContent = 'Ingresa un email válido (ejemplo@dominio.com)';
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '';
            this.classList.remove('invalid');
        }
    }

    function validateEdad() {
        const value = this.value;
        const errorElement = this.nextElementSibling;
        if (!value || !errorElement) return;

        const hoy = new Date();
        const nacimiento = new Date(value);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        if (edad < 12) {
            errorElement.textContent = 'Debes tener al menos 12 años para registrarte';
            this.classList.add('invalid');
        } else {
            errorElement.textContent = '';
            this.classList.remove('invalid');
        }
    }

    if (password) {
        password.addEventListener('input', validatePassword);
    }
    if (email) {
        email.addEventListener('input', validateEmail);
    }
    if (fechaNacimiento) {
        fechaNacimiento.addEventListener('change', validateEdad);
    }

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        console.log('Submit iniciado');

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                isValid = false;
                console.log('Campo vacío:', field.name);
            } else {
                field.classList.remove('invalid');
            }
        });
        
         if (password) {
        password.dispatchEvent(new Event('input')); 
        if (password.classList.contains('invalid')) {
            alert('La contraseña no cumple con los requisitos:\n\n- Mínimo 8 caracteres\n- Al menos una minúscula\n- Al menos una mayúscula\n- Al menos un número\n- Al menos un símbolo');
            return;
        }
    }

    if (email) {
        email.dispatchEvent(new Event('input')); 
        if (email.classList.contains('invalid')) {
            alert('El correo electrónico no es válido.');
            return;
        }
    }

    if (fechaNacimiento) {
        fechaNacimiento.dispatchEvent(new Event('change')); 
        if (fechaNacimiento.classList.contains('invalid')) {
            alert('Debes tener al menos 12 años para registrarte.');
            return;
        }
    }
    
    if (!isValid) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

        console.log('Validación pasada, creando FormData');
        const formData = new FormData(form);
          
        console.log('Datos del formulario:');
        for (let [key, value] of formData.entries()) {
            if (key === 'foto') {
                console.log(key, ':', value.name || 'sin archivo', value.size || 0, 'bytes');
            } else {
                console.log(key, ':', value);
            }
        }

        try {
            
            const res = await fetch("Public/php/api.php?endpoint=register", {
                method: "POST",
                body: formData
            });
            
            console.log('Status:', res.status, res.statusText);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            

            const responseText = await res.text();
            console.log('Respuesta:', responseText);
            
            if (!responseText || responseText.trim().length === 0) {
                throw new Error('Respuesta vacía del servidor');
            }
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('JSON parseado:', data);
            } catch (parseError) {
                console.error('Error JSON:', parseError);
                alert(`Error del servidor:\n\n${responseText.substring(0, 500)}`);
                return;
            }
            

            if (data.status === 'success') {
                console.log('Registro exitoso!');
                alert('¡Usuario registrado exitosamente!');
                
                if (data.user_id) {
                    console.log('nuevo usuario:', data.user_id);
                }
                
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
                
            } else {
                alert('Error: ' + (data.message || 'Error desconocido'));
            }
            
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });

});