document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector(".menu-lateral, .menu");
    if (!menu) return;

    const esSecundaria = elemento => elemento &&
        elemento.matches(".menu-item.submenu, .menu a.sub");

    function cerrarMenus() {
        menu.querySelectorAll(".menu-visible").forEach(opcion =>
            opcion.classList.remove("menu-visible"));
        menu.querySelectorAll(".menu-padre").forEach(opcion =>
            opcion.setAttribute("aria-expanded", "false"));
    }

    function abrirMenu(principal) {
        let opcion = principal.nextElementSibling;
        while (esSecundaria(opcion)) {
            opcion.classList.add("menu-visible");
            opcion = opcion.nextElementSibling;
        }
        principal.setAttribute("aria-expanded", "true");
    }

    menu.querySelectorAll("a").forEach(principal => {
        if (esSecundaria(principal) || !esSecundaria(principal.nextElementSibling)) return;
        principal.classList.add("menu-padre");
        principal.setAttribute("aria-expanded", "false");
        principal.addEventListener("click", evento => {
            evento.preventDefault();
            const estabaAbierto = principal.getAttribute("aria-expanded") === "true";
            cerrarMenus();
            if (!estabaAbierto) abrirMenu(principal);
        });
    });

    const activa = menu.querySelector(".menu-item.submenu.activo, .menu a.sub.activo");
    if (activa) {
        let principal = activa.previousElementSibling;
        while (principal && esSecundaria(principal)) principal = principal.previousElementSibling;
        if (principal) abrirMenu(principal);
    }
});
