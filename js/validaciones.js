// LOGIN DEL ADMINISTRADOR
// Variables, operadores, condicionales, funciones, parámetros y return.
const formulario = document.getElementById("formLogin");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mensajeError = document.getElementById("mensajeError");
const mostrarPassword = document.getElementById("mostrarPassword");
const recordarAdministrador = document.getElementById("recordarAdministrador");
const USUARIO_ADMINISTRADOR = "administrador";
const PASSWORD_ADMINISTRADOR = "1234";

function camposCompletos(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}
function validarCredenciales(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_ADMINISTRADOR && passwordIngresado === PASSWORD_ADMINISTRADOR;
}
function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = "block";
}
function guardarSesion(recordar) {
    sessionStorage.setItem("adminAutenticado", "true");
    sessionStorage.setItem("nombreAdministrador", "Administrador");
    if (recordar) {
        localStorage.setItem("recordarAdministrador", "true");
    } else {
        localStorage.removeItem("recordarAdministrador");
    }
}
function cambiarVisibilidadPassword() {
    if (password.type === "password") {
        password.type = "text";
        mostrarPassword.textContent = "🙈";
    } else {
        password.type = "password";
        mostrarPassword.textContent = "👁";
    }
}
function ejecutarPruebasAdministrador() {
    console.log("Prueba 1 administrador correcta:", validarCredenciales("administrador", "1234"));
    console.log("Prueba 2 contraseña incorrecta:", validarCredenciales("administrador", "0000"));
    console.log("Prueba 3 campos vacíos:", camposCompletos("", ""));
}

mostrarPassword.addEventListener("click", cambiarVisibilidadPassword);
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mensajeError.style.display = "none";
    let usuarioIngresado = usuario.value.trim().toLowerCase();
    let passwordIngresado = password.value.trim();
    if (!camposCompletos(usuarioIngresado, passwordIngresado)) {
        mostrarError("Por favor complete todos los campos.");
        return;
    }
    if (validarCredenciales(usuarioIngresado, passwordIngresado)) {
        guardarSesion(recordarAdministrador.checked);
        window.location.href = "dashboard_administrador.html";
    } else {
        mostrarError("Usuario o contraseña incorrectos.");
    }
});
ejecutarPruebasAdministrador();
