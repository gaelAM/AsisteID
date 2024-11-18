
// Función para mostrar/ocultar el menú de hamburguesa
function toggleMenu() {
    const nav = document.getElementById("nav");
    const hamburger = document.querySelector(".hamburger-menu");

    nav.classList.toggle("active");
    hamburger.classList.toggle("hidden"); // Oculta el icono de hamburguesa cuando el menú está abierto
}

// Cerrar el menú al hacer clic en un enlace dentro del menú
document.querySelectorAll("#nav a").forEach(link => {
    link.addEventListener("click", function() {
        const nav = document.getElementById("nav");
        const hamburger = document.querySelector(".hamburger-menu");

        nav.classList.remove("active");
        hamburger.classList.remove("hidden");
    });
});
