// LOGIN DEL ESTUDIANTE
// Variables, operadores, condicionales, funciones, parámetros y return.
const formularioEstudiante = document.getElementById("formLoginEstudiante");
const usuarioEstudiante = document.getElementById("usuarioEstudiante");
const passwordEstudiante = document.getElementById("passwordEstudiante");
const mensajeErrorEstudiante = document.getElementById("mensajeErrorEstudiante");
const mostrarPasswordEstudiante = document.getElementById("mostrarPasswordEstudiante");
const recordarEstudiante = document.getElementById("recordarEstudiante");
const USUARIO_ESTUDIANTE = "estudiante";
const PASSWORD_ESTUDIANTE = "1234";

function camposCompletosEstudiante(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}
function validarCredencialesEstudiante(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_ESTUDIANTE && passwordIngresado === PASSWORD_ESTUDIANTE;
}
function mostrarErrorEstudiante(mensaje) {
    mensajeErrorEstudiante.textContent = mensaje;
    mensajeErrorEstudiante.style.display = "block";
}
function guardarSesionEstudiante(recordar) {
    sessionStorage.setItem("estudianteAutenticado", "true");
    sessionStorage.setItem("nombreEstudiante", "Jessica Silva");
    if (recordar) {
        localStorage.setItem("recordarEstudiante", "true");
    } else {
        localStorage.removeItem("recordarEstudiante");
    }
}
function cambiarVisibilidadEstudiante() {
    const mostrar = passwordEstudiante.type === "password";
    passwordEstudiante.type = mostrar ? "text" : "password";
    mostrarPasswordEstudiante.textContent = mostrar ? "🙈" : "👁";
}
function ejecutarPruebasEstudiante() {
    console.log("Prueba 1 estudiante correcta:", validarCredencialesEstudiante("estudiante", "1234"));
    console.log("Prueba 2 usuario incorrecto:", validarCredencialesEstudiante("alumno", "1234"));
    console.log("Prueba 3 campos vacíos:", camposCompletosEstudiante("", ""));
}

mostrarPasswordEstudiante.addEventListener("click", cambiarVisibilidadEstudiante);
formularioEstudiante.addEventListener("submit", function (evento) {
    evento.preventDefault();
    mensajeErrorEstudiante.style.display = "none";
    let usuarioIngresado = usuarioEstudiante.value.trim().toLowerCase();
    let passwordIngresado = passwordEstudiante.value.trim();
    if (!camposCompletosEstudiante(usuarioIngresado, passwordIngresado)) {
        mostrarErrorEstudiante("Por favor complete todos los campos.");
        return;
    }
    if (validarCredencialesEstudiante(usuarioIngresado, passwordIngresado)) {
        guardarSesionEstudiante(recordarEstudiante.checked);
        window.location.href = "dashboard_estudiante.html";
    } else {
        mostrarErrorEstudiante("Usuario o contraseña incorrectos.");
    }
});
ejecutarPruebasEstudiante();
