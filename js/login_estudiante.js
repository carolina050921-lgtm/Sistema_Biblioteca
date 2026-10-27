// =============================================
// LOGIN DEL ESTUDIANTE
// Variables, operadores, condicionales,
// funciones, parámetros, return y pruebas.
// =============================================

// 1. VARIABLES Y CONSTANTES
const formularioEstudiante = document.getElementById("formLoginEstudiante");
const campoUsuarioEstudiante = document.getElementById("usuarioEstudiante");
const campoPasswordEstudiante = document.getElementById("passwordEstudiante");
const mensajeErrorEstudiante = document.getElementById("mensajeErrorEstudiante");
const botonMostrarPasswordEstudiante = document.getElementById("mostrarPasswordEstudiante");
const casillaRecordarEstudiante = document.getElementById("recordarEstudiante");

const USUARIO_ESTUDIANTE = "estudiante";
const PASSWORD_ESTUDIANTE = "1234";

// 2. FUNCIÓN CON PARÁMETROS Y RETURN
function camposCompletosEstudiante(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}

// 3. OPERADORES RELACIONALES Y LÓGICOS
function validarCredencialesEstudiante(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_ESTUDIANTE &&
        passwordIngresado === PASSWORD_ESTUDIANTE;
}

function mostrarMensajeErrorEstudiante(mensaje) {
    mensajeErrorEstudiante.textContent = mensaje;
    mensajeErrorEstudiante.style.display = "block";
}

function ocultarMensajeErrorEstudiante() {
    mensajeErrorEstudiante.textContent = "";
    mensajeErrorEstudiante.style.display = "none";
}

// 4. CONDICIONAL IF - ELSE
function guardarSesionEstudiante(recordarSesion) {
    sessionStorage.setItem("estudianteAutenticado", "true");
    sessionStorage.setItem("perfilBiblioteca", "estudiante");
    sessionStorage.setItem("nombreEstudiante", "Jessica Silva");

    if (recordarSesion) {
        localStorage.setItem("recordarEstudiante", "true");
    } else {
        localStorage.removeItem("recordarEstudiante");
    }
}

function cambiarVisibilidadPasswordEstudiante() {
    if (campoPasswordEstudiante.type === "password") {
        campoPasswordEstudiante.type = "text";
        botonMostrarPasswordEstudiante.textContent = "🙈";
    } else {
        campoPasswordEstudiante.type = "password";
        botonMostrarPasswordEstudiante.textContent = "👁";
    }
}

// 5. PROCESAMIENTO PRINCIPAL DEL LOGIN
function procesarLoginEstudiante(evento) {
    evento.preventDefault();
    ocultarMensajeErrorEstudiante();

    let usuarioIngresado = campoUsuarioEstudiante.value.trim().toLowerCase();
    let passwordIngresado = campoPasswordEstudiante.value.trim();

    if (!camposCompletosEstudiante(usuarioIngresado, passwordIngresado)) {
        mostrarMensajeErrorEstudiante("Por favor complete todos los campos.");
        return;
    }

    if (validarCredencialesEstudiante(usuarioIngresado, passwordIngresado)) {
        guardarSesionEstudiante(casillaRecordarEstudiante.checked);
        window.location.href = "dashboard_estudiante.html";
    } else {
        mostrarMensajeErrorEstudiante("Usuario o contraseña incorrectos.");
    }
}

// 6. EVENTOS
botonMostrarPasswordEstudiante.addEventListener("click", cambiarVisibilidadPasswordEstudiante);
formularioEstudiante.addEventListener("submit", procesarLoginEstudiante);

// 7. TRES CASOS DE PRUEBA SOLICITADOS EN LA CLASE
function ejecutarPruebasEstudiante() {
    const pruebaCorrecta = validarCredencialesEstudiante("estudiante", "1234");
    const pruebaIncorrecta = validarCredencialesEstudiante("estudiante", "0000");
    const pruebaCamposVacios = camposCompletosEstudiante("", "");

    console.log("Prueba 1 - Credenciales correctas:", pruebaCorrecta);
    console.log("Prueba 2 - Contraseña incorrecta:", pruebaIncorrecta);
    console.log("Prueba 3 - Campos vacíos:", pruebaCamposVacios);
}

ejecutarPruebasEstudiante();
