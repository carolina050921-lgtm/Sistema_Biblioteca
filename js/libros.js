document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formLibro");
    const mensaje = document.getElementById("mensajeLibro");
    const portada = document.getElementById("portada");
    const portadaPrevia = document.getElementById("portadaPrevia");
    const resumen = document.getElementById("resumen");
    const ejemplares = document.getElementById("ejemplares");
    const clave = "bibliotecaLibros";
    let portadaSeleccionada = "";

    function obtenerLibros() { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function guardarLibros(libros) { localStorage.setItem(clave, JSON.stringify(libros)); }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function mostrarMensaje(texto, clase) { mensaje.textContent = texto; mensaje.className = "mensaje " + clase; mensaje.scrollIntoView({behavior:"smooth",block:"center"}); }

    function renderizar() {
        const libros = obtenerLibros().slice(-6).reverse();
        document.getElementById("tablaLibros").innerHTML = libros.length ? libros.map(libro => `<tr><td>${escapar(libro.codigo)}</td><td>${escapar(libro.titulo)}</td><td>${escapar(libro.autor)}</td><td>${escapar(libro.categoria)}</td><td>${escapar(libro.ejemplares)}</td><td>${escapar(libro.disponibles)}</td><td>${escapar(libro.adquisicion)}</td><td><span class="estado">${escapar(libro.estado)}</span></td></tr>`).join("") : '<tr><td class="vacio" colspan="8">Aún no hay libros registrados.</td></tr>';
    }

    resumen.addEventListener("input", () => document.getElementById("contadorResumen").textContent = resumen.value.length);
    ejemplares.addEventListener("input", () => { const cantidad = Number(ejemplares.value) || 0; document.getElementById("resumenEjemplares").textContent = cantidad + (cantidad === 1 ? " ejemplar" : " ejemplares"); });
    portada.addEventListener("change", function () {
        const archivo = portada.files[0]; if (!archivo) return;
        if (archivo.size > 2 * 1024 * 1024) { portada.value = ""; mostrarMensaje("La portada no puede superar los 2 MB.", "error"); return; }
        const lector = new FileReader(); lector.onload = evento => { portadaSeleccionada = evento.target.result; portadaPrevia.innerHTML = `<img class="imagen-portada" src="${portadaSeleccionada}" alt="Portada seleccionada">`; }; lector.readAsDataURL(archivo);
    });
    form.addEventListener("reset", evento => setTimeout(() => { portadaSeleccionada=""; portada.value=""; portadaPrevia.textContent="📖"; document.getElementById("contadorResumen").textContent="0"; document.getElementById("resumenEjemplares").textContent="1 ejemplar"; if(evento.isTrusted)mensaje.className="mensaje"; },0));
    form.addEventListener("submit", async function (evento) {
        evento.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
        const libros = obtenerLibros(); const codigo = document.getElementById("codigo").value.trim(); const isbn = document.getElementById("isbn").value.trim();
        if (libros.some(libro => libro.codigo.toLowerCase() === codigo.toLowerCase())) { mostrarMensaje("Ya existe un libro con ese código de clasificación.", "error"); return; }
        if (isbn && libros.some(libro => libro.isbn === isbn)) { mostrarMensaje("Ya existe un libro registrado con ese ISBN.", "error"); return; }
        const cantidad = Number(ejemplares.value);
        const hoy = new Date(); const fechaRegistro = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        const libro = { codigo, titulo:document.getElementById("titulo").value.trim(), autor:document.getElementById("autor").value.trim(), anio:document.getElementById("anio").value, editorial:document.getElementById("editorial").value.trim(), edicion:document.getElementById("edicion").value.trim(), isbn, categoria:document.getElementById("categoria").value, ejemplares:cantidad, disponibles:document.getElementById("estado").value === "Disponible" ? cantidad : 0, disponibilidad:document.getElementById("estado").value === "Disponible" ? cantidad + " disponibles" : document.getElementById("estado").value, ubicacion:document.getElementById("ubicacion").value.trim(), adquisicion:document.getElementById("adquisicion").value, procedencia:document.getElementById("procedencia").value.trim(), modalidad:document.getElementById("modalidad").value, estado:document.getElementById("estado").value, resumen:resumen.value.trim(), portada:portadaSeleccionada, fechaRegistro };
        try { await BibliotecaAPI.guardar("libros", libro); libros.push(libro); guardarLibros(libros); renderizar(); form.reset(); mostrarMensaje("Libro registrado correctamente.", "exito"); }
        catch (error) { mostrarMensaje(error.message + " Verifique que Apache y MySQL estén activos.", "error"); }
    });
    renderizar();
});
