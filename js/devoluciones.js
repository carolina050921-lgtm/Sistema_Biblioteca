document.addEventListener("DOMContentLoaded", function () {
    const claveNormal = "bibliotecaPrestamos";
    const claveExterno = "bibliotecaPrestamosExternos";
    const buscar = document.getElementById("buscarDevolucion");
    const form = document.getElementById("formDevolucion");
    const fechaReal = document.getElementById("fechaDevolucionReal");
    const cumplimiento = document.getElementById("cumplimiento");
    const mensaje = document.getElementById("mensajeDevolucion");

    function leer(clave) { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function guardar(clave, datos) { localStorage.setItem(clave, JSON.stringify(datos)); }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function fechaLocal(fecha) { const copia = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000); return copia.toISOString().slice(0,10); }
    function etiquetaExterno(tipo) { return tipo === "visitante" ? "Visitante autorizado" : "Personal administrativo"; }

    function obtenerTodos() {
        const normales = leer(claveNormal).map((item, indice) => ({...item, origen:"normal", indice, documento:item.documento||"", nombre:item.usuario, titulo:item.libro}));
        const externos = leer(claveExterno).map((item, indice) => ({...item, origen:"externo", indice, codigo:"PE-"+String(indice+1).padStart(3,"0"), nombre:item.nombres+" "+item.apellidos, titulo:item.tituloLibro, tipo:etiquetaExterno(item.tipo)}));
        return normales.concat(externos);
    }

    function estaVencido(item) { return item.fechaDevolucion && new Date(item.fechaDevolucion+"T23:59:59") < new Date(); }
    function calcularCumplimiento() {
        const seleccion = obtenerTodos().find(item => item.origen === document.getElementById("origenPrestamo").value && String(item.indice) === document.getElementById("indicePrestamo").value);
        if (!seleccion || !fechaReal.value) { cumplimiento.value = "Se calculará automáticamente"; return; }
        const resultado = fechaReal.value <= seleccion.fechaDevolucion ? "Dentro del plazo" : "Fuera del plazo";
        cumplimiento.value = resultado; document.getElementById("avisoSancion").style.display = resultado === "Fuera del plazo" ? "block" : "none";
    }

    function seleccionar(origen, indice) {
        const item = obtenerTodos().find(registro => registro.origen === origen && registro.indice === indice);
        if (!item) return;
        document.getElementById("origenPrestamo").value = origen; document.getElementById("indicePrestamo").value = indice;
        document.getElementById("seleccionPrestamo").className = "seleccion-activa";
        document.getElementById("seleccionPrestamo").innerHTML = `<strong>${escapar(item.nombre)}</strong><br>${escapar(item.codigo)} · ${escapar(item.titulo)} · Fecha límite: ${escapar(item.fechaDevolucion)}`;
        document.getElementById("btnRegistrarDevolucion").disabled = false; calcularCumplimiento();
    }

    function renderizar() {
        const todos = obtenerTodos(); const pendientes = todos.filter(item => item.estado !== "Devuelto"); const texto = buscar.value.trim().toLowerCase();
        const filtrados = pendientes.filter(item => [item.codigo,item.documento,item.nombre,item.titulo].some(valor => String(valor||"").toLowerCase().includes(texto)));
        document.getElementById("tablaPendientes").innerHTML = filtrados.length ? filtrados.map(item => `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.nombre)}</td><td>${escapar(item.documento)||"-"}</td><td>${escapar(item.titulo)}</td><td>${escapar(item.fechaDevolucion)}</td><td><span class="estado ${estaVencido(item)?"vencido":"activo"}">${estaVencido(item)?"Vencido":"Activo"}</span></td><td><button class="seleccionar" data-origen="${item.origen}" data-indice="${item.indice}">Seleccionar</button></td></tr>`).join("") : '<tr><td class="vacio" colspan="7">No hay préstamos pendientes que coincidan con la búsqueda.</td></tr>';
        document.querySelectorAll(".seleccionar").forEach(boton => boton.addEventListener("click", () => seleccionar(boton.dataset.origen, Number(boton.dataset.indice))));
        const devueltos = todos.filter(item => item.estado === "Devuelto").slice().reverse();
        document.getElementById("tablaDevueltos").innerHTML = devueltos.length ? devueltos.map(item => `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.nombre)}</td><td>${escapar(item.titulo)}</td><td>${escapar(item.fechaDevolucionReal)}</td><td>${escapar(item.estadoFisico)}</td><td class="${item.cumplimiento==="Dentro del plazo"?"cumple":"tarde"}">${escapar(item.cumplimiento)}</td><td>${escapar(item.observacionesDevolucion)||"Sin observaciones"}</td></tr>`).join("") : '<tr><td class="vacio" colspan="7">Aún no se han registrado devoluciones.</td></tr>';
        const hoy = fechaLocal(new Date()); document.getElementById("totalActivos").textContent = pendientes.length; document.getElementById("totalVencidos").textContent = pendientes.filter(estaVencido).length; document.getElementById("totalDevueltosHoy").textContent = devueltos.filter(item => item.fechaDevolucionReal === hoy).length; document.getElementById("totalObservados").textContent = devueltos.filter(item => item.estadoFisico === "Dañado" || (item.observacionesDevolucion||"").trim()).length;
    }

    fechaReal.value = fechaLocal(new Date()); fechaReal.addEventListener("change", calcularCumplimiento); buscar.addEventListener("input", renderizar);
    form.addEventListener("submit", async function (evento) {
        evento.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
        const origen = document.getElementById("origenPrestamo").value; const indice = Number(document.getElementById("indicePrestamo").value); const clave = origen === "externo" ? claveExterno : claveNormal; const datos = leer(clave);
        if (!datos[indice] || datos[indice].estado === "Devuelto") { mensaje.textContent = "El préstamo seleccionado ya no está disponible."; mensaje.className = "mensaje error"; renderizar(); return; }
        if (!datos[indice].id) { mensaje.textContent = "Este préstamo anterior no está vinculado a la base de datos. Registre nuevamente el préstamo para poder devolverlo desde el sistema."; mensaje.className = "mensaje error"; return; }
        try { await fetch("http://localhost/sistema_biblioteca_api/index.php?recurso=prestamos", {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({accion:"devolver", id:datos[indice].id, fecha_devolucion_real:fechaReal.value, estado_fisico:document.getElementById("estadoFisico").value, cumplimiento:cumplimiento.value, observaciones_devolucion:document.getElementById("observacionesDevolucion").value.trim()})}).then(async r => { const json = await r.json(); if (!r.ok || !json.ok) throw new Error(json.mensaje); }); }
        catch (error) { mensaje.textContent = error.message || "No se pudo registrar la devolución."; mensaje.className = "mensaje error"; return; }
        datos[indice].estado = "Devuelto"; datos[indice].fechaDevolucionReal = fechaReal.value; datos[indice].estadoFisico = document.getElementById("estadoFisico").value; datos[indice].cumplimiento = cumplimiento.value; datos[indice].observacionesDevolucion = document.getElementById("observacionesDevolucion").value.trim(); guardar(clave, datos);
        form.reset(); fechaReal.value = fechaLocal(new Date()); document.getElementById("seleccionPrestamo").className = "seleccion-vacia"; document.getElementById("seleccionPrestamo").textContent = "Ningún préstamo seleccionado"; document.getElementById("btnRegistrarDevolucion").disabled = true; document.getElementById("avisoSancion").style.display = "none"; mensaje.textContent = "Devolución registrada correctamente."; mensaje.className = "mensaje exito"; renderizar();
    });
    renderizar();
});
