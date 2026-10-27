// FUNCIONALIDAD PRINCIPAL DEL DASHBOARD ESTUDIANTE
document.addEventListener("DOMContentLoaded", function () {
    sessionStorage.setItem("perfilBiblioteca", "estudiante");
    function obtenerDatosEstudiante(clave) {
        try {
            const datos = JSON.parse(localStorage.getItem(clave) || "[]");
            return Array.isArray(datos) ? datos : [];
        } catch (error) { return []; }
    }

    function escaparTexto(valor) {
        return String(valor || "").replace(/[&<>'"]/g, function (caracter) {
            return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[caracter];
        });
    }

    function formatearFecha(fecha) {
        const partes = String(fecha || "").split("-");
        if (partes.length === 3) {
            return partes[2] + "/" + partes[1] + "/" + partes[0];
        }
        return fecha || "-";
    }

    function estaVencido(prestamo) {
        const fechaLimite = new Date(prestamo.fechaDevolucion + "T23:59:59");
        return prestamo.estado !== "Devuelto" && fechaLimite < new Date();
    }

    function obtenerIniciales(nombreCompleto) {
        const nombres = nombreCompleto.split(" ");
        let iniciales = nombres[0].charAt(0);
        if (nombres.length > 1) {
            iniciales = iniciales + nombres[1].charAt(0);
        }
        return iniciales.toUpperCase();
    }

    function cerrarSesionEstudiante() {
        sessionStorage.removeItem("estudianteAutenticado");
        sessionStorage.removeItem("nombreEstudiante");
        localStorage.removeItem("recordarEstudiante");
    }

    const nombreEstudiante = sessionStorage.getItem("nombreEstudiante") || "Estudiante CMVO";

    function renderizarSolicitudes() {
        const solicitudes = obtenerDatosEstudiante("bibliotecaSolicitudesPrestamo").filter(function (solicitud) {
            return window.esRegistroActual(solicitud) && solicitud.tipo === "Estudiante" && (solicitud.estudiante || solicitud.usuario) === nombreEstudiante;
        });
        document.getElementById("tablaSolicitudesEstudiante").innerHTML = solicitudes.length ? solicitudes.slice().reverse().map(function (solicitud) {
            const aprobada = solicitud.estado === "Aprobada";
            const estado = aprobada ? "Aprobado para recojo" : (solicitud.estado || "Pendiente");
            const clase = aprobada ? "aprobada" : (estado === "Pendiente" ? "pendiente" : "");
            return `<tr><td>${escaparTexto(window.codigoSolicitudVisible(solicitud))}</td><td>${escaparTexto(solicitud.libro)}</td><td>${escaparTexto(formatearFecha(solicitud.fechaSolicitud))}</td><td>${escaparTexto(formatearFecha(solicitud.fechaRecojo))}</td><td><span class="estado ${clase}">${escaparTexto(estado)}</span></td></tr>`;
        }).join("") : '<tr><td class="tabla-vacia" colspan="5">No tienes solicitudes de préstamo registradas.</td></tr>';
    }
    renderizarSolicitudes();
    window.addEventListener("storage", function (evento) {
        if (evento.key === "bibliotecaSolicitudesPrestamo" || evento.key === null) renderizarSolicitudes();
    });
    window.addEventListener("focus", renderizarSolicitudes);
    window.addEventListener("pageshow", renderizarSolicitudes);
    const libros = obtenerDatosEstudiante("bibliotecaLibros").filter(window.esLibroActual);
    document.querySelector(".contenedor-libros").innerHTML = libros.slice().sort((a,b) => a.categoria.localeCompare(b.categoria, "es") || a.titulo.localeCompare(b.titulo, "es")).map(libro => {
        return '<article class="libro-card"><div class="portada portada1"><img src="' + escaparTexto(libro.portada) + '" alt="' + escaparTexto(libro.titulo) + '" style="width:100%;height:100%;object-fit:contain"></div><div class="info-libro"><span class="categoria">' + escaparTexto(libro.categoria) + '</span><h3>' + escaparTexto(libro.titulo) + '</h3><p>' + escaparTexto(libro.resumen) + '</p><button type="button" data-libro="' + escaparTexto(libro.titulo) + '">Ver libro</button></div></article>';
    }).join("");
    document.querySelector(".contenedor-libros").addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-libro]");
        if (boton) window.location.href = "buscar_libros.html?perfil=estudiante&libro=" + encodeURIComponent(boton.dataset.libro);
    });
    const prestamos = obtenerDatosEstudiante("bibliotecaPrestamos");
    const prestamosDelEstudiante = prestamos.filter(function (prestamo) {
        return window.esRegistroActual(prestamo) && prestamo.tipo === "Estudiante" && (prestamo.estudiante || prestamo.usuario) === nombreEstudiante;
    });
    const prestamosActivos = prestamosDelEstudiante.filter(function (prestamo) {
        return prestamo.estado !== "Devuelto";
    });
    const librosDisponibles = libros.filter(function (libro) {
        return Number(libro.disponibles) > 0 || libro.estado === "Disponible";
    });
    const prestamosVencidos = prestamosActivos.filter(estaVencido);

    document.getElementById("nombrePerfilEstudiante").textContent = nombreEstudiante;
    document.getElementById("nombreHeaderEstudiante").textContent = nombreEstudiante;
    document.getElementById("nombreBienvenidaEstudiante").textContent = nombreEstudiante.split(" ")[0];
    document.getElementById("inicialesEstudiante").textContent = obtenerIniciales(nombreEstudiante);
    document.getElementById("librosDisponiblesEstudiante").textContent = librosDisponibles.length;
    document.getElementById("prestamosEstudiante").textContent = prestamosDelEstudiante.length;
    document.getElementById("porDevolverEstudiante").textContent = prestamosActivos.length;
    document.getElementById("alertasEstudiante").textContent = prestamosVencidos.length;

    const tabla = document.getElementById("tablaPrestamosEstudiante");
    if (prestamosActivos.length > 0) {
        tabla.innerHTML = prestamosActivos.map(function (prestamo) {
            const vencido = estaVencido(prestamo);
            return `<tr><td><div class="libro-tabla"><div class="mini-libro"><i class="fa-solid fa-book"></i></div><div><strong>${escaparTexto(prestamo.libro)}</strong><p>${escaparTexto(prestamo.ejemplar || "Ejemplar registrado")}</p></div></div></td><td>${formatearFecha(prestamo.fechaPrestamo)}</td><td>${formatearFecha(prestamo.fechaDevolucion)}</td><td><span class="estado ${vencido ? "proximo" : "vigente"}">${vencido ? "Vencido" : "Vigente"}</span></td></tr>`;
        }).join("");
    } else {
        tabla.innerHTML = '<tr><td colspan="4">No tienes préstamos activos registrados.</td></tr>';
    }

    document.getElementById("cerrarSesionEstudiante").addEventListener("click", cerrarSesionEstudiante);
    console.log("Dashboard estudiante:", prestamosActivos.length + " préstamos activos");
});
