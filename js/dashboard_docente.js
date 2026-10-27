document.addEventListener("DOMContentLoaded", function () {
    sessionStorage.setItem("perfilBiblioteca", "docente");
    function cerrarSesionDocente() {
        sessionStorage.removeItem("docenteAutenticado");
        sessionStorage.removeItem("nombreDocente");
        localStorage.removeItem("recordarDocente");
    }

    function leer(clave) {
        try { return JSON.parse(localStorage.getItem(clave)) || []; }
        catch (error) { return []; }
    }

    function escapar(valor) {
        return String(valor || "").replace(/[&<>'"]/g, function (caracter) {
            return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[caracter];
        });
    }

    function formatearFecha(valor) {
        if (!valor) return "-";
        const partes = valor.split("-");
        return partes.length === 3 ? partes[2] + "/" + partes[1] + "/" + partes[0] : valor;
    }

    function estaVencido(prestamo) {
        if (!prestamo.fechaDevolucion || prestamo.estado === "Devuelto") return false;
        const limite = new Date(prestamo.fechaDevolucion + "T23:59:59");
        return limite < new Date();
    }

    const nombre = sessionStorage.getItem("nombreDocente") || "Docente CMVO";
    const palabras = nombre.trim().split(/\s+/);
    const iniciales = palabras.slice(0, 2).map(function (palabra) { return palabra.charAt(0).toUpperCase(); }).join("") || "DC";
    document.getElementById("nombrePerfil").textContent = nombre;
    document.getElementById("nombreHeader").textContent = nombre;
    document.getElementById("nombreBienvenida").textContent = palabras[0] || "Docente";
    document.getElementById("inicialesDocente").textContent = iniciales;

    function renderizarSolicitudes() {
        const solicitudes = leer("bibliotecaSolicitudesPrestamo").filter(function (solicitud) {
            return window.esRegistroActual(solicitud) && solicitud.tipo === "Docente" && solicitud.docente === nombre;
        });
        document.getElementById("tablaSolicitudesDocente").innerHTML = solicitudes.length ? solicitudes.slice().reverse().map(function (solicitud) {
            const aprobada = solicitud.estado === "Aprobada";
            const estado = aprobada ? "Aprobado para recojo" : (solicitud.estado || "Pendiente");
            const clase = aprobada ? "aprobada" : (estado === "Pendiente" ? "pendiente" : "");
            return `<tr><td>${escapar(window.codigoSolicitudVisible(solicitud))}</td><td>${escapar(solicitud.libro)}</td><td>${escapar(formatearFecha(solicitud.fechaSolicitud))}</td><td>${escapar(formatearFecha(solicitud.fechaRecojo))}</td><td><span class="estado ${clase}">${escapar(estado)}</span></td></tr>`;
        }).join("") : '<tr><td class="tabla-vacia" colspan="5">No tienes solicitudes de préstamo registradas.</td></tr>';
    }

    renderizarSolicitudes();
    window.addEventListener("storage", function (evento) {
        if (evento.key === "bibliotecaSolicitudesPrestamo" || evento.key === null) renderizarSolicitudes();
    });
    window.addEventListener("pageshow", renderizarSolicitudes);
    window.addEventListener("focus", renderizarSolicitudes);

    const prestamosDocente = leer("bibliotecaPrestamos").filter(function (prestamo) { return window.esRegistroActual(prestamo) && prestamo.tipo === "Docente" && (prestamo.docente || prestamo.usuario) === nombre; });
    const activos = prestamosDocente.filter(function (prestamo) { return prestamo.estado !== "Devuelto"; });
    const alertas = activos.filter(estaVencido);
    const libros = leer("bibliotecaLibros").filter(window.esLibroActual);
    const disponibles = libros.filter(function (libro) { return libro.estado === "Disponible" || libro.disponibilidad === "Disponible" || Number(libro.ejemplares || libro.cantidad || 0) > 0; });

    document.getElementById("librosDisponibles").textContent = disponibles.length;
    document.getElementById("prestamosActivos").textContent = activos.length;
    document.getElementById("porDevolver").textContent = activos.length;
    document.getElementById("totalHistorial").textContent = prestamosDocente.length;
    document.getElementById("totalAlertas").textContent = alertas.length;

    document.getElementById("tablaPrestamosDocente").innerHTML = activos.length ? activos.slice().reverse().map(function (prestamo) {
        const vencido = estaVencido(prestamo);
        return `<tr><td><div class="libro-tabla"><div class="mini-libro"><i class="fa-solid fa-book"></i></div><div><strong>${escapar(prestamo.libro)}</strong><p>Préstamo docente</p></div></div></td><td>${escapar(prestamo.ejemplar) || "-"}</td><td>${formatearFecha(prestamo.fechaPrestamo)}</td><td>${formatearFecha(prestamo.fechaDevolucion)}</td><td><span class="estado ${vencido ? "vencido" : "vigente"}">${vencido ? "Vencido" : "Vigente"}</span></td></tr>`;
    }).join("") : '<tr><td class="tabla-vacia" colspan="5">No tienes préstamos activos registrados.</td></tr>';

    const recomendaciones = libros.slice().sort((a, b) => a.categoria.localeCompare(b.categoria, "es") || a.titulo.localeCompare(b.titulo, "es"));
    const iconos = ["fa-book-open", "fa-flask", "fa-laptop-code", "fa-diagram-project"];
    document.getElementById("librosRecomendados").innerHTML = recomendaciones.map(function (libro, indice) {
        const titulo = libro.titulo || libro.nombre || "Material bibliográfico";
        const categoria = libro.categoria || "Biblioteca";
        const resumen = libro.resumen || libro.descripcion || "Recurso disponible para consulta y apoyo académico.";
        return `<article class="libro-card"><div class="portada portada${indice % 4 + 1}"><img src="${escapar(libro.portada)}" alt="${escapar(titulo)}" style="width:100%;height:100%;object-fit:contain"></div><div class="info-libro"><span class="categoria">${escapar(categoria)}</span><h3>${escapar(titulo)}</h3><p>${escapar(resumen)}</p><div class="estrellas">★★★★★</div><button type="button" class="enlace-libro ver-detalle-libro" data-indice="${indice}"><i class="fa-solid fa-eye"></i> Ver libro</button></div></article>`;
    }).join("");

    const modal = document.getElementById("modalLibro");
    const formulario = document.getElementById("formSolicitudDocente");
    const accionesDetalle = document.getElementById("accionesDetalle");
    const mensajeSolicitud = document.getElementById("mensajeSolicitud");
    const fechaRecojo = document.getElementById("fechaRecojo");
    let libroSeleccionado = null;

    function datoLibro(libro, propiedades, predeterminado) {
        for (let indice = 0; indice < propiedades.length; indice += 1) {
            if (libro[propiedades[indice]] !== undefined && libro[propiedades[indice]] !== "") return libro[propiedades[indice]];
        }
        return predeterminado;
    }

    function disponiblesLibro(libro) {
        const cantidad = Number(datoLibro(libro, ["disponibles", "ejemplares", "cantidad"], 0));
        return Number.isFinite(cantidad) ? cantidad : 0;
    }

    function abrirDetalle(indice) {
        libroSeleccionado = recomendaciones[indice];
        if (!libroSeleccionado) return;
        document.getElementById("detallePortada").innerHTML = `<img src="${escapar(libroSeleccionado.portada)}" alt="${escapar(libroSeleccionado.titulo)}" style="width:100%;max-height:315px;object-fit:contain">`;
        document.getElementById("detalleTitulo").textContent = datoLibro(libroSeleccionado, ["titulo", "nombre"], "Material bibliográfico");
        document.getElementById("detalleCategoria").textContent = datoLibro(libroSeleccionado, ["categoria"], "Biblioteca");
        document.getElementById("detalleAutor").textContent = "Autor: " + datoLibro(libroSeleccionado, ["autor"], "No registrado");
        document.getElementById("detalleDescripcion").textContent = datoLibro(libroSeleccionado, ["resumen", "descripcion"], "Recurso disponible para consulta y apoyo académico.");
        document.getElementById("detalleCodigo").textContent = datoLibro(libroSeleccionado, ["codigo"], "Sin código");
        document.getElementById("detalleIsbn").textContent = datoLibro(libroSeleccionado, ["isbn", "ISBN"], "No registrado");
        document.getElementById("detalleEditorial").textContent = datoLibro(libroSeleccionado, ["editorial"], "No registrada");
        document.getElementById("detalleAnio").textContent = datoLibro(libroSeleccionado, ["anio", "año"], "No registrado");
        document.getElementById("detalleUbicacion").textContent = datoLibro(libroSeleccionado, ["ubicacion"], "Consultar en biblioteca");
        document.getElementById("detalleDisponibles").textContent = disponiblesLibro(libroSeleccionado);
        const existente = window.solicitudesPrestamo.existente(libroSeleccionado, "Docente", nombre);
        const botonSolicitud = document.getElementById("mostrarSolicitud");
        botonSolicitud.disabled = !!existente || !window.solicitudesPrestamo.disponible(libroSeleccionado);
        botonSolicitud.textContent = existente ? (existente.estado === "Aprobada" ? "Aprobado para recojo" : "Pendiente de aprobación") : (libroSeleccionado.modalidad === "Consulta interna" ? "Solo consulta en biblioteca" : "Solicitar préstamo");
        formulario.reset();
        formulario.querySelector("button[type='submit']").disabled = false;
        formulario.classList.remove("activo");
        accionesDetalle.hidden = false;
        mensajeSolicitud.textContent = "";
        mensajeSolicitud.className = "mensaje-solicitud";
        modal.classList.add("abierto");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function cerrarDetalle() {
        modal.classList.remove("abierto");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function mostrarFormulario() {
        accionesDetalle.hidden = true;
        formulario.classList.add("activo");
        const rango = window.solicitudesPrestamo.limites();
        const fechaMinima = rango.min;
        const fechaMaxima = rango.max;
        fechaRecojo.min = fechaMinima;
        fechaRecojo.max = fechaMaxima;
        fechaRecojo.value = fechaMinima;
        fechaRecojo.focus();
    }

    async function enviarSolicitud(evento) {
        evento.preventDefault();
        mensajeSolicitud.className = "mensaje-solicitud error";
        try {
            await window.solicitudesPrestamo.enviar(libroSeleccionado, "Docente", nombre, fechaRecojo.value, document.getElementById("motivoSolicitud").value, document.getElementById("observacionSolicitud").value, document.getElementById("programaSolicitud").value, document.getElementById("semestreSolicitud").value);
        } catch (error) {
            mensajeSolicitud.textContent = error.message;
            return;
        }
        renderizarSolicitudes();
        mensajeSolicitud.className = "mensaje-solicitud exito";
        mensajeSolicitud.textContent = "Solicitud enviada. La bibliotecaria deberá aprobarla y asignar el ejemplar. El préstamo será por 14 días.";
        formulario.querySelector("button[type='submit']").disabled = true;
    }

    document.querySelectorAll(".ver-detalle-libro").forEach(function (boton) {
        boton.addEventListener("click", function () { abrirDetalle(Number(boton.dataset.indice)); });
    });
    document.getElementById("cerrarDetalle").addEventListener("click", cerrarDetalle);
    document.getElementById("cancelarDetalle").addEventListener("click", cerrarDetalle);
    document.getElementById("mostrarSolicitud").addEventListener("click", mostrarFormulario);
    document.getElementById("volverDetalle").addEventListener("click", function () {
        formulario.classList.remove("activo");
        accionesDetalle.hidden = false;
    });
    formulario.addEventListener("submit", enviarSolicitud);
    modal.addEventListener("click", function (evento) { if (evento.target === modal) cerrarDetalle(); });
    document.addEventListener("keydown", function (evento) { if (evento.key === "Escape") cerrarDetalle(); });
    document.getElementById("cerrarSesionDocente").addEventListener("click", cerrarSesionDocente);
    console.log("Dashboard docente:", activos.length + " préstamos activos");
});
