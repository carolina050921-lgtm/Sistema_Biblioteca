document.addEventListener("DOMContentLoaded", function () {
    const parametros = new URLSearchParams(window.location.search);
    const tipo = parametros.get("tipo") === "visitante" ? "visitante" : "administrativo";
    const etiqueta = tipo === "visitante" ? "Visitante autorizado" : "Personal administrativo";
    const plural = tipo === "visitante" ? "visitantes autorizados" : "personal administrativo";
    const clave = "bibliotecaPrestamosExternos";
    const form = document.getElementById("formPrestamoExterno");
    const mensaje = document.getElementById("mensaje");

    document.title = "Préstamo a " + etiqueta + " | Biblioteca CMVO";
    document.getElementById("tituloPagina").textContent = "Préstamo a " + etiqueta.toLowerCase();
    document.getElementById("subtituloPagina").textContent = "Registra la entrega de libros a " + plural + " sin acceso al sistema.";
    document.getElementById("rutaTipo").textContent = etiqueta;
    document.getElementById("tituloFormulario").textContent = "Datos de " + etiqueta.toLowerCase();
    document.getElementById("tituloRecientes").textContent = "Préstamos a " + plural;
    document.getElementById("iconoTipo").textContent = tipo === "visitante" ? "🪪" : "🏢";
    document.getElementById(tipo === "visitante" ? "menuVisitante" : "menuAdministrativo").classList.add("activo");

    const hoy = new Date();
    const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    const fechaLocal = fecha => { const copia = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000); return copia.toISOString().slice(0, 10); };
    document.getElementById("fechaPrestamo").value = fechaLocal(hoy);
    document.getElementById("fechaDevolucion").value = fechaLocal(manana);

    function obtenerPrestamos() { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function guardarPrestamos(datos) { localStorage.setItem(clave, JSON.stringify(datos)); }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function mostrarMensaje(texto, clase) { mensaje.textContent = texto; mensaje.className = "mensaje " + clase; }
    function renderizar() {
        const datos = obtenerPrestamos().filter(item => item.tipo === tipo).reverse();
        document.getElementById("tablaPrestamos").innerHTML = datos.length ? datos.map(item => `<tr><td>${escapar(item.documento)}</td><td>${escapar(item.nombres)} ${escapar(item.apellidos)}</td><td>${escapar(item.tituloLibro)}</td><td>${escapar(item.ejemplar)}</td><td>${escapar(item.fechaPrestamo)}</td><td>${escapar(item.fechaDevolucion)}</td><td>${escapar(item.modalidad)}</td><td><span class="estado">Activo</span></td></tr>`).join("") : `<tr><td class="vacio" colspan="8">Aún no hay préstamos registrados para ${plural}.</td></tr>`;
    }

    form.addEventListener("submit", async function (evento) {
        evento.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
        const datos = obtenerPrestamos();
        const valor = id => document.getElementById(id).value.trim();
        const registro = { tipo, documento: valor("documento"), nombres: valor("nombres"), apellidos: valor("apellidos"), telefono: valor("telefono"), area: valor("area"), direccion: valor("direccion"), codigoLibro: valor("codigoLibro"), tituloLibro: valor("tituloLibro"), ejemplar: valor("ejemplar"), fechaPrestamo: valor("fechaPrestamo"), fechaDevolucion: valor("fechaDevolucion"), modalidad: valor("modalidad"), observaciones: valor("observaciones"), estado: "Activo" };
        try { const guardado = await BibliotecaAPI.guardar("prestamos", {codigo:"PE-"+String(Date.now()), origen:"externo", tipoUsuario:registro.tipo, documento:registro.documento, nombres:registro.nombres, apellidos:registro.apellidos, telefono:registro.telefono, area:registro.area, direccion:registro.direccion, codigoLibro:registro.codigoLibro, tituloLibro:registro.tituloLibro, ejemplar:registro.ejemplar, fechaPrestamo:registro.fechaPrestamo, fechaDevolucion:registro.fechaDevolucion, modalidad:registro.modalidad, observaciones:registro.observaciones, estado:registro.estado}); registro.id = guardado.id; datos.push(registro); guardarPrestamos(datos); renderizar(); form.reset(); document.getElementById("fechaPrestamo").value = fechaLocal(hoy); document.getElementById("fechaDevolucion").value = fechaLocal(manana); mostrarMensaje("Préstamo registrado correctamente.", "exito"); }
        catch (error) { mostrarMensaje(error.message + " Verifique que Apache y MySQL estén activos.", "error"); }
    });
    renderizar();
});
