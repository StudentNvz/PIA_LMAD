document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("createModal");
    const createBtn = document.getElementById("createPostBtn");
    const closeBtn = document.querySelector(".close");
    const loginBtn = document.getElementById("loginBtn");

    function openModal() {
        if (localStorage.getItem("isLoggedIn") === "true") {
            modal.style.display = "block";
        } else {
            alert("Por favor inicia sesión para crear una publicación");
            window.location.href = "login.html";
        }
    }

    function closeModal() {
        modal.style.display = "none";
    }

    if (createBtn) {
        createBtn.addEventListener("click", openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    const postForm = document.getElementById("create-post-form");
    if (postForm) {
        postForm.addEventListener("submit", function(e) {
            e.preventDefault();
            console.log("Creando publicación...");
            closeModal();
        });
    }
});