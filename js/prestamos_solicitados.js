document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const clave = "bibliotecaSolicitudesPrestamo";
    const tabla = document.getElementById("tablaSolicitudes");
    const buscar = document.getElementById("buscarSolicitud");
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroEstado = document.getElementById("filtroEstado");
    const mensaje = document.getElementById("mensajeGestion");

    function leerSolicitudes() {
        try {
            const datos = JSON.parse(localStorage.getItem(clave)) || [];
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            console.error("No se pudieron leer las solicitudes.", error);
            return [];
        }
    }

    function guardarSolicitudes(datos) {
        localStorage.setItem(clave, JSON.stringify(datos));
    }

    function escapar(valor) {
        return String(valor || "-").replace(/[&<>'"]/g, function (caracter) {
            return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[caracter];
        });
    }

    function fecha(valor) {
        if (!valor) return "-";
        const partes = valor.split("-");
        return partes.length === 3 ? partes[2] + "/" + partes[1] + "/" + partes[0] : valor;
    }

    function estadoSolicitud(solicitud) {
        return solicitud.estado === "Aprobada" ? "Aprobada" : "Pendiente";
    }

    function actualizarResumen(datos, filtrados) {
        document.getElementById("totalSolicitudes").textContent = datos.length;
        document.getElementById("totalPendientes").textContent = datos.filter(function (item) { return estadoSolicitud(item) === "Pendiente"; }).length;
        document.getElementById("totalAprobadas").textContent = datos.filter(function (item) { return estadoSolicitud(item) === "Aprobada"; }).length;
        document.getElementById("totalResultados").textContent = filtrados.length;
    }

    function renderizar() {
        const datos = leerSolicitudes();
        const texto = buscar.value.trim().toLowerCase();
        const filtrados = datos.filter(function (solicitud) {
            const contenido = [solicitud.docente, solicitud.estudiante, solicitud.usuario, solicitud.libro, solicitud.codigoSolicitud, window.codigoSolicitudVisible(solicitud)].join(" ").toLowerCase();
            const coincideTexto = !texto || contenido.includes(texto);
            const coincideTipo = !filtroTipo.value || solicitud.tipo === filtroTipo.value;
            const coincideEstado = !filtroEstado.value || estadoSolicitud(solicitud) === filtroEstado.value;
            return coincideTexto && coincideTipo && coincideEstado;
        }).reverse();

        actualizarResumen(datos, filtrados);
        tabla.innerHTML = filtrados.length ? filtrados.map(function (solicitud) {
            const estado = estadoSolicitud(solicitud);
            const usuario = solicitud.docente || solicitud.estudiante || solicitud.usuario || "Usuario no indicado";
            const accion = estado === "Pendiente"
                ? `<button type="button" class="btn-aprobar" data-codigo="${escapar(solicitud.codigoSolicitud)}">Aprobar para recojo</button>`
                : '<span class="estado-recojo">Aprobado para recojo<br>Fecha: ' + escapar(fecha(solicitud.fechaAprobacion)) + '</span>';
            return `<tr><td>${escapar(window.codigoSolicitudVisible(solicitud))}</td><td>${escapar(usuario)}</td><td><span class="tipo">${escapar(solicitud.tipo)}</span></td><td>${escapar(solicitud.programa || "No registrado")}</td><td>${escapar(solicitud.semestre || "No registrado")}</td><td>${escapar(solicitud.libro)}</td><td>${fecha(solicitud.fechaSolicitud)}</td><td>${fecha(solicitud.fechaRecojo)}</td><td>${escapar(solicitud.motivo)}</td><td><span class="estado ${estado.toLowerCase()}">${estado}</span></td><td>${accion}</td></tr>`;
        }).join("") : '<tr><td class="vacio" colspan="11">No hay solicitudes que coincidan con la búsqueda.</td></tr>';
    }

    async function aprobarSolicitud(codigo) {
        const solicitudes = leerSolicitudes();
        const solicitud = solicitudes.find(item => item.codigoSolicitud === codigo);
        if (!solicitud || estadoSolicitud(solicitud) !== "Pendiente") return;
        solicitud.estado = "Aprobada";
        solicitud.estadoRecojo = "Aprobado para recojo";
        solicitud.fechaAprobacion = new Date().toISOString().split("T")[0];
        try {
            await BibliotecaAPI.aprobarSolicitud(solicitud.codigoSolicitud, solicitud.fechaAprobacion);
            guardarSolicitudes(solicitudes);
        } catch (error) {
            mensaje.textContent = "No se pudo guardar la aprobación. Intenta nuevamente.";
            mensaje.classList.add("visible");
            return;
        }
        mensaje.textContent = "Solicitud " + window.codigoSolicitudVisible(solicitud) + " aprobada. El libro quedó listo para recojo.";
        mensaje.classList.add("visible");
        renderizar();
    }

    tabla.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-aprobar");
        if (boton) aprobarSolicitud(boton.dataset.codigo);
    });
    buscar.addEventListener("input", renderizar);
    filtroTipo.addEventListener("change", renderizar);
    filtroEstado.addEventListener("change", renderizar);
    window.addEventListener("storage", renderizar);
    window.addEventListener("focus", renderizar);
    window.addEventListener("pageshow", renderizar);
    renderizar();
    if (window.BibliotecaAPI) BibliotecaAPI.migrarRegistrosLocales().then(renderizar).catch(function (error) {
        console.error("No se pudieron migrar las solicitudes a MySQL.", error);
    });
});
