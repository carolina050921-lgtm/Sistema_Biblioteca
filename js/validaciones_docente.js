// LOGIN DEL DOCENTE
// Variables, operadores, condicionales, funciones, parámetros y return.
const formularioDocente = document.getElementById("formLoginDocente");
const usuarioDocente = document.getElementById("usuarioDocente");
const passwordDocente = document.getElementById("passwordDocente");
const mensajeErrorDocente = document.getElementById("mensajeErrorDocente");
const mensajeCorrectoDocente = document.getElementById("mensajeCorrectoDocente");
const mostrarPasswordDocente = document.getElementById("mostrarPasswordDocente");
const recordarDocente = document.getElementById("recordarDocente");
const USUARIO_DOCENTE = "docente";
const PASSWORD_DOCENTE = "1234";

function camposCompletosDocente(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}
function validarCredencialesDocente(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_DOCENTE && passwordIngresado === PASSWORD_DOCENTE;
}
function mostrarErrorDocente(mensaje) {
    mensajeErrorDocente.textContent = mensaje;
    mensajeErrorDocente.style.display = "block";
}
function guardarSesionDocente(recordar) {
    sessionStorage.setItem("docenteAutenticado", "true");
    sessionStorage.setItem("nombreDocente", "Docente CMVO");
    if (recordar) {
        localStorage.setItem("recordarDocente", "true");
    } else {
        localStorage.removeItem("recordarDocente");
    }
}
function cambiarVisibilidadDocente() {
    const mostrar = passwordDocente.type === "password";
    passwordDocente.type = mostrar ? "text" : "password";
    mostrarPasswordDocente.textContent = mostrar ? "🙈" : "👁";
}
function ejecutarPruebasDocente() {
    console.log("Prueba 1 docente correcta:", validarCredencialesDocente("docente", "1234"));
    console.log("Prueba 2 contraseña incorrecta:", validarCredencialesDocente("docente", "abcd"));
    console.log("Prueba 3 campos vacíos:", camposCompletosDocente("", ""));
}

mostrarPasswordDocente.addEventListener("click", cambiarVisibilidadDocente);
formularioDocente.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mensajeErrorDocente.style.display = "none";
    mensajeCorrectoDocente.style.display = "none";
    let usuarioIngresado = usuarioDocente.value.trim().toLowerCase();
    let passwordIngresado = passwordDocente.value.trim();
    if (!camposCompletosDocente(usuarioIngresado, passwordIngresado)) {
        mostrarErrorDocente("Por favor complete todos los campos.");
        return;
    }
    if (validarCredencialesDocente(usuarioIngresado, passwordIngresado)) {
        guardarSesionDocente(recordarDocente.checked);
        mensajeCorrectoDocente.textContent = "Acceso docente correcto.";
        mensajeCorrectoDocente.style.display = "block";
        setTimeout(function () {
            window.location.href = "dashboard_docente.html";
        }, 500);
    } else {
        mostrarErrorDocente("Usuario o contraseña incorrectos.");
    }
});
ejecutarPruebasDocente();
