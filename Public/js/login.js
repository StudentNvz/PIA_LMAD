document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const response = await fetch('./Public/php/api.php?endpoint=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data); 

        if (data.status === 'success') {
            alert('¡Inicio de sesión exitoso!');

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", data.user.nombre_completo);
            localStorage.setItem("userEmail", data.user.correo);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userRole", data.user.rol);
            AppStorage.saveUserData({
                id: data.user.id,
                nombre: data.user.nombre_completo,
                email: data.user.correo,
                rol: data.user.rol
            });
            window.location.href = 'index.html';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error de conexión: ' + error.message);
    }
});

function toggleDarkMode(checkbox){
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        checkbox.checked = true;
    } else {
        localStorage.setItem("theme", "light");
        checkbox.checked = false;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("toggleTheme");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (checkbox) checkbox.checked = true;
    }
});