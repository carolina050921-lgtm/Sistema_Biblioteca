document.addEventListener("DOMContentLoaded", function () {
    const texto = document.getElementById("textoBusqueda");
    const categoria = document.getElementById("filtroCategoria");
    const disponibilidad = document.getElementById("filtroDisponibilidad");

    function leerLibros() { try { return JSON.parse(localStorage.getItem("bibliotecaLibros")) || []; } catch (error) { return []; } }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]; }); }
    function cantidadDisponible(libro) { const cantidad = Number(libro.disponibles); return Number.isFinite(cantidad) ? cantidad : (libro.estado === "Disponible" ? Number(libro.ejemplares) || 1 : 0); }
    function catalogoCompleto() {
        const registrados = leerLibros();
        return registrados.filter(window.esLibroActual);
    }

    const parametros = new URLSearchParams(window.location.search);
    texto.value = parametros.get("libro") || "";
    const perfilSolicitado = parametros.get("perfil");
    const perfil = ["docente", "estudiante"].includes(perfilSolicitado) ? perfilSolicitado : (sessionStorage.getItem("perfilBiblioteca") || "estudiante");
    const esDocente = perfil === "docente";
    sessionStorage.setItem("perfilBiblioteca", perfil);
    document.querySelector('.menu a.activo').href = "buscar_libros.html?perfil=" + perfil;
    const nombre = sessionStorage.getItem(esDocente ? "nombreDocente" : "nombreEstudiante") || (esDocente ? "Docente CMVO" : "Estudiante CMVO");
    document.getElementById("nombrePerfil").textContent = nombre;
    document.getElementById("tipoPerfil").textContent = esDocente ? "Docente" : "Estudiante";
    document.getElementById("iconoPerfil").innerHTML = `<i class="fa-solid ${esDocente ? "fa-chalkboard-user" : "fa-user-graduate"}"></i>`;
    document.getElementById("enlaceInicio").href = esDocente ? "dashboard_docente.html" : "dashboard_estudiante.html";
    document.getElementById("enlacePrestamos").href = (esDocente ? "dashboard_docente.html" : "dashboard_estudiante.html") + "#misPrestamos";
    document.getElementById("enlaceCerrar").href = esDocente ? "login_docente.html" : "login_estudiante.html";

    const programas = ["Arquitectura de Plataformas y Servicios de TI", "Acuicultura y Procesamiento Pesquero", "Mecatrónica Automotriz", "Enfermería Técnica"];
    Array.from(new Set(programas.concat(catalogoCompleto().map(function (libro) { return libro.categoria; }).filter(Boolean)))).sort().forEach(function (nombreCategoria) {
        const opcion = document.createElement("option"); opcion.value = nombreCategoria; opcion.textContent = nombreCategoria; categoria.appendChild(opcion);
    });

    function renderizar() {
        const consulta = texto.value.trim().toLowerCase();
        const filtrados = catalogoCompleto().filter(function (libro) {
            const campos = [libro.titulo, libro.autor, libro.isbn, libro.codigo, libro.categoria].join(" ").toLowerCase();
            const disponibles = cantidadDisponible(libro);
            const coincideDisponibilidad = !disponibilidad.value || (disponibilidad.value === "disponible" ? disponibles > 0 : disponibles === 0);
            return (!consulta || campos.includes(consulta)) && (!categoria.value || libro.categoria === categoria.value) && coincideDisponibilidad;
        });
        filtrados.sort(function (a, b) {
            return String(a.categoria || "").localeCompare(String(b.categoria || ""), "es") || String(a.titulo || "").localeCompare(String(b.titulo || ""), "es");
        });
        document.getElementById("cantidadResultados").textContent = filtrados.length;
        document.getElementById("catalogoLibros").innerHTML = filtrados.length ? filtrados.map(function (libro, indice) {
            const disponibles = cantidadDisponible(libro); const disponible = disponibles > 0;
            const solicitud = window.solicitudesPrestamo.existente(libro, esDocente ? "Docente" : "Estudiante", nombre);
            const habilitado = !solicitud && window.solicitudesPrestamo.disponible(libro);
            const etiqueta = solicitud ? (solicitud.estado === "Aprobada" ? "Aprobado para recojo" : "Pendiente de aprobación") : (libro.modalidad === "Consulta interna" ? "Solo consulta en biblioteca" : (habilitado ? "Solicitar préstamo" : "No disponible"));
            const accionSolicitud = '<button type="button" class="solicitar-prestamo" data-solicitar="' + escapar(libro.codigo || libro.titulo) + '" ' + (habilitado ? '' : 'disabled') + '>' + etiqueta + '</button>';
            const portada = libro.portada ? `<img src="${escapar(libro.portada)}" alt="Portada de ${escapar(libro.titulo)}">` : `<i class="fa-solid fa-book-open"></i><small>${escapar(libro.codigo)}</small>`;
            return `<article class="libro"><div class="portada ${String(libro.categoria).includes("Enfermería") ? "enfermeria" : ""}">${portada}</div><div class="datos-libro"><div class="fila-superior"><span class="categoria">${escapar(libro.categoria)}</span><span class="${disponible ? "disponible" : "no-disponible"}">${disponible ? disponibles + " disponible" + (disponibles === 1 ? "" : "s") : "No disponible"}</span></div><h2>${escapar(libro.titulo)}</h2><p class="autor">${escapar(libro.autor)} · ${escapar(libro.anio)}</p><p class="resumen">${escapar(libro.resumen) || "Sin resumen registrado."}</p><div class="ficha"><div><strong>Código Dewey</strong>${escapar(libro.codigo)}</div><div><strong>ISBN</strong>${escapar(libro.isbn) || "No registrado"}</div><div><strong>Ejemplares</strong>${escapar(libro.ejemplares)}</div><div><strong>Adquisición</strong>${escapar(libro.adquisicion)}</div><div class="ubicacion"><strong>Ubicación física</strong><i class="fa-solid fa-location-dot"></i> ${escapar(libro.ubicacion)}</div></div><div class="pie-libro"><span class="modalidad"><i class="fa-solid fa-circle-info"></i> ${escapar(libro.modalidad)}</span><button class="detalles" type="button" data-detalle="detalle-${indice}">Ver detalles</button>${accionSolicitud}</div><div class="detalle-adicional" id="detalle-${indice}"><strong>Introducción del contenido:</strong><p>${escapar(libro.introduccion || libro.resumen) || "Sin introducción registrada."}</p>${libro.datosSimulados ? "<p>Registro de práctica: datos bibliográficos e inventario simulados; introducción orientativa.</p>" : ""}<strong>Editorial:</strong> ${escapar(libro.editorial) || "No registrada"}<br><strong>Edición:</strong> ${escapar(libro.edicion) || "No registrada"}<br><strong>Procedencia:</strong> ${escapar(libro.procedencia) || "No registrada"}<br><strong>Estado:</strong> ${escapar(libro.estado)}</div></div></article>`;
        }).join("") : '<div class="sin-resultados"><i class="fa-solid fa-book-open"></i>No se encontraron libros con los filtros seleccionados.</div>';
    }

    document.getElementById("catalogoLibros").addEventListener("click", function (evento) {
        const boton = evento.target.closest(".detalles"); if (!boton) return;
        const detalle = document.getElementById(boton.dataset.detalle); detalle.classList.toggle("visible"); boton.textContent = detalle.classList.contains("visible") ? "Ocultar detalles" : "Ver detalles";
    });
    [texto, categoria, disponibilidad].forEach(function (control) { control.addEventListener(control === texto ? "input" : "change", renderizar); });
    document.getElementById("limpiarFiltros").addEventListener("click", function () { texto.value = ""; categoria.value = ""; disponibilidad.value = ""; renderizar(); });
    const dialogo = document.getElementById("solicitudCatalogo");
    const formulario = document.getElementById("formSolicitudCatalogo");
    const recojo = document.getElementById("recojoCatalogo");
    const mensaje = document.getElementById("mensajeCatalogo");
    const enviar = document.getElementById("enviarSolicitudCatalogo");
    let seleccionado = null;
    document.getElementById("catalogoLibros").addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-solicitar]");
        if (!boton || boton.disabled) return;
        seleccionado = catalogoCompleto().find(libro => String(libro.codigo || libro.titulo) === boton.dataset.solicitar);
        if (!seleccionado) return;
        formulario.reset();
        const programaSolicitud = document.getElementById("programaCatalogo");
        programaSolicitud.value = categoria.value;
        programaSolicitud.disabled = Boolean(programaSolicitud.value);
        document.getElementById("libroSolicitud").textContent = seleccionado.titulo;
        const rango = window.solicitudesPrestamo.limites();
        recojo.min = rango.min; recojo.max = rango.max; recojo.value = rango.min;
        mensaje.textContent = ""; enviar.disabled = false;
        dialogo.showModal();
        recojo.focus();
    });
    document.getElementById("cerrarSolicitudCatalogo").addEventListener("click", function () { dialogo.close(); });
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        if (!formulario.reportValidity()) return;
        try {
            await window.solicitudesPrestamo.enviar(seleccionado, esDocente ? "Docente" : "Estudiante", nombre, recojo.value, document.getElementById("motivoCatalogo").value, document.getElementById("observacionCatalogo").value, document.getElementById("programaCatalogo").value, document.getElementById("semestreCatalogo").value);
            mensaje.textContent = "Solicitud enviada al administrador. Estado: Pendiente de aprobación. Puedes consultar su estado en este catálogo.";
            enviar.disabled = true;
            renderizar();
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });
    window.addEventListener("storage", renderizar);
    window.addEventListener("focus", renderizar);
    window.addEventListener("pageshow", renderizar);
    renderizar();
});
