// =============================================
// LOGIN DEL DOCENTE
// Variables, operadores, condicionales,
// funciones, parámetros, return y pruebas.
// =============================================

// 1. VARIABLES Y CONSTANTES
const formularioDocente = document.getElementById("formLoginDocente");
const campoUsuarioDocente = document.getElementById("usuarioDocente");
const campoPasswordDocente = document.getElementById("passwordDocente");
const mensajeErrorDocente = document.getElementById("mensajeErrorDocente");
const mensajeCorrectoDocente = document.getElementById("mensajeCorrectoDocente");
const botonMostrarPasswordDocente = document.getElementById("mostrarPasswordDocente");
const casillaRecordarDocente = document.getElementById("recordarDocente");

const USUARIO_DOCENTE = "docente";
const PASSWORD_DOCENTE = "1234";

// 2. FUNCIÓN CON PARÁMETROS Y RETURN
function camposCompletosDocente(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}

// 3. OPERADORES RELACIONALES Y LÓGICOS
function validarCredencialesDocente(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_DOCENTE &&
        passwordIngresado === PASSWORD_DOCENTE;
}

function mostrarMensajeErrorDocente(mensaje) {
    mensajeErrorDocente.textContent = mensaje;
    mensajeErrorDocente.style.display = "block";
    mensajeCorrectoDocente.style.display = "none";
}

function ocultarMensajesDocente() {
    mensajeErrorDocente.textContent = "";
    mensajeCorrectoDocente.textContent = "";
    mensajeErrorDocente.style.display = "none";
    mensajeCorrectoDocente.style.display = "none";
}

// 4. CONDICIONAL IF - ELSE
function guardarSesionDocente(recordarSesion) {
    sessionStorage.setItem("docenteAutenticado", "true");
    sessionStorage.setItem("perfilBiblioteca", "docente");
    sessionStorage.setItem("nombreDocente", "Docente CMVO");

    if (recordarSesion) {
        localStorage.setItem("recordarDocente", "true");
    } else {
        localStorage.removeItem("recordarDocente");
    }
}

function cambiarVisibilidadPasswordDocente() {
    if (campoPasswordDocente.type === "password") {
        campoPasswordDocente.type = "text";
        botonMostrarPasswordDocente.textContent = "🙈";
    } else {
        campoPasswordDocente.type = "password";
        botonMostrarPasswordDocente.textContent = "👁";
    }
}

// 5. PROCESAMIENTO PRINCIPAL DEL LOGIN
function procesarLoginDocente(evento) {
    evento.preventDefault();
    ocultarMensajesDocente();

    let usuarioIngresado = campoUsuarioDocente.value.trim().toLowerCase();
    let passwordIngresado = campoPasswordDocente.value.trim();

    if (!camposCompletosDocente(usuarioIngresado, passwordIngresado)) {
        mostrarMensajeErrorDocente("Por favor complete todos los campos.");
        return;
    }

    if (validarCredencialesDocente(usuarioIngresado, passwordIngresado)) {
        guardarSesionDocente(casillaRecordarDocente.checked);
        mensajeCorrectoDocente.textContent = "Acceso docente correcto.";
        mensajeCorrectoDocente.style.display = "block";

        setTimeout(function () {
            window.location.href = "dashboard_docente.html";
        }, 500);
    } else {
        mostrarMensajeErrorDocente("Usuario o contraseña incorrectos.");
    }
}

// 6. EVENTOS
botonMostrarPasswordDocente.addEventListener("click", cambiarVisibilidadPasswordDocente);
formularioDocente.addEventListener("submit", procesarLoginDocente);

// 7. TRES CASOS DE PRUEBA SOLICITADOS EN LA CLASE
function ejecutarPruebasDocente() {
    const pruebaCorrecta = validarCredencialesDocente("docente", "1234");
    const pruebaIncorrecta = validarCredencialesDocente("docente", "0000");
    const pruebaCamposVacios = camposCompletosDocente("", "");

    console.log("Prueba 1 - Credenciales correctas:", pruebaCorrecta);
    console.log("Prueba 2 - Contraseña incorrecta:", pruebaIncorrecta);
    console.log("Prueba 3 - Campos vacíos:", pruebaCamposVacios);
}

ejecutarPruebasDocente();
