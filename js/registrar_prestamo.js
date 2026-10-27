document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formRegistrarPrestamo");
    const mensaje = document.getElementById("mensajePrestamo");
    const clave = "bibliotecaPrestamos";
    const fechaPrestamo = document.getElementById("fechaPrestamo");
    const fechaDevolucion = document.getElementById("fechaDevolucion");
    const dias = document.getElementById("dias");

    const fechaLocal = fecha => {
        const copia = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
        return copia.toISOString().slice(0, 10);
    };

    function establecerFechas() {
        const hoy = new Date(); const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
        fechaPrestamo.value = fechaLocal(hoy); fechaDevolucion.value = fechaLocal(manana); dias.value = "1 día";
    }
    function obtener() { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function guardar(datos) { localStorage.setItem(clave, JSON.stringify(datos)); }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function actualizarDias() {
        if (!fechaPrestamo.value || !fechaDevolucion.value) return;
        const diferencia = Math.round((new Date(fechaDevolucion.value) - new Date(fechaPrestamo.value)) / 86400000);
        dias.value = diferencia >= 0 ? diferencia + (diferencia === 1 ? " día" : " días") : "Fecha inválida";
    }
    function renderizar() {
        const datos = obtener().slice(-5).reverse();
        document.getElementById("tablaPrestamosRecientes").innerHTML = datos.length ? datos.map(item => `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.usuario)}</td><td>${escapar(item.tipo)}</td><td>${escapar(item.libro)}</td><td>${escapar(item.fechaPrestamo)}</td><td>${escapar(item.fechaDevolucion)}</td><td><span class="estado">${escapar(item.estado)}</span></td></tr>`).join("") : '<tr><td colspan="7" style="text-align:center;color:#71869d">Aún no hay préstamos registrados.</td></tr>';
    }

    fechaPrestamo.addEventListener("change", actualizarDias); fechaDevolucion.addEventListener("change", actualizarDias);
    form.addEventListener("reset", () => setTimeout(establecerFechas, 0));
    form.addEventListener("submit", async function (evento) {
        evento.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
        if (new Date(fechaDevolucion.value) < new Date(fechaPrestamo.value)) { mensaje.textContent = "La fecha de devolución no puede ser anterior al préstamo."; mensaje.className = "mensaje error"; return; }
        const referencia = document.getElementById("buscarUsuario").value.trim();
        const esDocumento = /^[0-9]{8,15}$/.test(referencia);
        const datos = obtener();
        const registro = { codigo: "PR-" + String(datos.length + 1).padStart(3, "0"), usuario: esDocumento ? "Usuario " + referencia : referencia, documento: esDocumento ? referencia : "", tipo: document.querySelector('input[name="tipo"]:checked').value, libro: document.getElementById("buscarLibro").value.trim(), ejemplar: document.getElementById("ejemplar").value.trim(), fechaPrestamo: fechaPrestamo.value, fechaDevolucion: fechaDevolucion.value, observaciones: document.getElementById("observaciones").value.trim(), estado: "Activo" };
        try { const guardado = await BibliotecaAPI.guardar("prestamos", {...registro, origen:"normal", tipoUsuario:registro.tipo, tituloLibro:registro.libro, codigoLibro:""}); registro.id = guardado.id; datos.push(registro); guardar(datos); renderizar(); form.reset(); mensaje.textContent = "Préstamo registrado correctamente."; mensaje.className = "mensaje exito"; }
        catch (error) { mensaje.textContent = error.message + " Verifique que Apache y MySQL estén activos."; mensaje.className = "mensaje error"; }
    });
    establecerFechas(); renderizar();
});
