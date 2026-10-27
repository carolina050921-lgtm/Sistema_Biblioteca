// =============================================
// LOGIN DEL ADMINISTRADOR
// Variables, operadores, condicionales,
// funciones, parámetros, return y pruebas.
// =============================================

// 1. VARIABLES Y CONSTANTES
const formularioAdministrador = document.getElementById("formLogin");
const campoUsuarioAdministrador = document.getElementById("usuario");
const campoPasswordAdministrador = document.getElementById("password");
const mensajeErrorAdministrador = document.getElementById("mensajeError");
const botonMostrarPassword = document.getElementById("mostrarPassword");
const casillaRecordarAdministrador = document.getElementById("recordarAdministrador");

const USUARIO_ADMINISTRADOR = "administrador";
const PASSWORD_ADMINISTRADOR = "1234";

// 2. FUNCIÓN CON PARÁMETROS Y RETURN
function camposCompletos(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado !== "" && passwordIngresado !== "";
}

// 3. OPERADORES RELACIONALES Y LÓGICOS
function validarCredenciales(usuarioIngresado, passwordIngresado) {
    return usuarioIngresado === USUARIO_ADMINISTRADOR &&
        passwordIngresado === PASSWORD_ADMINISTRADOR;
}

function mostrarMensajeError(mensaje) {
    mensajeErrorAdministrador.textContent = mensaje;
    mensajeErrorAdministrador.style.display = "block";
}

function ocultarMensajeError() {
    mensajeErrorAdministrador.textContent = "";
    mensajeErrorAdministrador.style.display = "none";
}

// 4. CONDICIONAL IF - ELSE
function guardarSesionAdministrador(recordarSesion) {
    sessionStorage.setItem("adminAutenticado", "true");
    sessionStorage.setItem("nombreAdministrador", "Administrador");

    if (recordarSesion) {
        localStorage.setItem("recordarAdministrador", "true");
    } else {
        localStorage.removeItem("recordarAdministrador");
    }
}

function cambiarVisibilidadPassword() {
    if (campoPasswordAdministrador.type === "password") {
        campoPasswordAdministrador.type = "text";
        botonMostrarPassword.textContent = "🙈";
    } else {
        campoPasswordAdministrador.type = "password";
        botonMostrarPassword.textContent = "👁";
    }
}

// 5. PROCESAMIENTO PRINCIPAL DEL LOGIN
function procesarLoginAdministrador(evento) {
    evento.preventDefault();
    ocultarMensajeError();

    let usuarioIngresado = campoUsuarioAdministrador.value.trim().toLowerCase();
    let passwordIngresado = campoPasswordAdministrador.value.trim();

    if (!camposCompletos(usuarioIngresado, passwordIngresado)) {
        mostrarMensajeError("Por favor complete todos los campos.");
        return;
    }

    if (validarCredenciales(usuarioIngresado, passwordIngresado)) {
        guardarSesionAdministrador(casillaRecordarAdministrador.checked);
        window.location.href = "dashboard_administrador.html";
    } else {
        mostrarMensajeError("Usuario o contraseña incorrectos.");
    }
}

// 6. EVENTOS
botonMostrarPassword.addEventListener("click", cambiarVisibilidadPassword);
formularioAdministrador.addEventListener("submit", procesarLoginAdministrador);

// 7. TRES CASOS DE PRUEBA SOLICITADOS EN LA CLASE
function ejecutarPruebasAdministrador() {
    const pruebaCorrecta = validarCredenciales("administrador", "1234");
    const pruebaIncorrecta = validarCredenciales("administrador", "0000");
    const pruebaCamposVacios = camposCompletos("", "");

    console.log("Prueba 1 - Credenciales correctas:", pruebaCorrecta);
    console.log("Prueba 2 - Contraseña incorrecta:", pruebaIncorrecta);
    console.log("Prueba 3 - Campos vacíos:", pruebaCamposVacios);
}

ejecutarPruebasAdministrador();
