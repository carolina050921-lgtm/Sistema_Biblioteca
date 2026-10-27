// FUNCIONALIDAD PRINCIPAL DEL DASHBOARD ADMINISTRADOR
// Interactividad, eventos, DOM, procesamiento y validación de datos.
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const claves = [
        "bibliotecaLibros",
        "bibliotecaUsuarios",
        "bibliotecaPrestamos",
        "bibliotecaPrestamosExternos"
    ];

    function obtenerDatos(clave) {
        try {
            const datosGuardados = localStorage.getItem(clave);
            if (!datosGuardados) return [];

            const datos = JSON.parse(datosGuardados);
            if (!Array.isArray(datos)) {
                console.error("Los datos de " + clave + " no tienen un formato válido.");
                return [];
            }
            return datos;
        } catch (error) {
            console.error("No se pudieron procesar los datos de " + clave + ".", error);
            return [];
        }
    }

    function obtenerTexto(objeto, propiedades, valorPredeterminado) {
        for (let indice = 0; indice < propiedades.length; indice += 1) {
            const valor = objeto[propiedades[indice]];
            if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
                return String(valor).trim();
            }
        }
        return valorPredeterminado;
    }

    function sumarEjemplares(libros) {
        return libros.reduce(function (total, libro) {
            const cantidad = Number(libro.ejemplares || libro.cantidad || libro.stock || 0);
            return total + (Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0);
        }, 0);
    }

    function crearFecha(valor) {
        if (!valor) return null;
        const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
            ? new Date(valor + "T23:59:59")
            : new Date(valor);
        return Number.isNaN(fecha.getTime()) ? null : fecha;
    }

    function estaDevuelto(prestamo) {
        const estado = obtenerTexto(prestamo, ["estado"], "").toLowerCase();
        return estado === "devuelto" || estado === "finalizado";
    }

    function prestamoVencido(prestamo) {
        const fecha = crearFecha(obtenerTexto(
            prestamo,
            ["fechaDevolucion", "fecha_devolucion", "fechaLimite"],
            ""
        ));
        return !estaDevuelto(prestamo) && fecha !== null && fecha < new Date();
    }

    function obtenerSaludo(hora) {
        if (hora < 12) return "Buenos días";
        if (hora < 19) return "Buenas tardes";
        return "Buenas noches";
    }

    function colocarTexto(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    function formatearFecha(valor) {
        const fecha = crearFecha(valor);
        if (!fecha) return "-";
        return new Intl.DateTimeFormat("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(fecha);
    }

    function iniciales(nombre) {
        return nombre.split(" ").filter(Boolean).slice(0, 2).map(function (parte) {
            return parte.charAt(0).toUpperCase();
        }).join("") || "US";
    }

    function crearCelda(texto) {
        const celda = document.createElement("td");
        celda.textContent = texto;
        return celda;
    }

    function crearCeldaUsuario(nombre, tipo) {
        const celda = document.createElement("td");
        const contenedor = document.createElement("div");
        const avatar = document.createElement("span");
        const datos = document.createElement("div");
        const nombreElemento = document.createElement("strong");
        const tipoElemento = document.createElement("small");

        contenedor.className = "usuario-tabla";
        avatar.className = "avatar-mini";
        avatar.textContent = iniciales(nombre);
        nombreElemento.textContent = nombre;
        tipoElemento.textContent = tipo;
        datos.append(nombreElemento, tipoElemento);
        contenedor.append(avatar, datos);
        celda.appendChild(contenedor);
        return celda;
    }

    function crearCeldaEstado(estado) {
        const celda = document.createElement("td");
        const etiqueta = document.createElement("span");
        etiqueta.className = "estado " + (estado === "Vencido" ? "vencido" : "activo");
        etiqueta.textContent = estado;
        celda.appendChild(etiqueta);
        return celda;
    }

    function normalizarPrestamo(prestamo, indice) {
        const esExterno = Boolean(prestamo.nombres || prestamo.tituloLibro);
        const nombreExterno = [prestamo.nombres, prestamo.apellidos].filter(Boolean).join(" ");
        const tipoExterno = prestamo.tipo === "visitante"
            ? "Visitante autorizado"
            : "Personal administrativo";

        return {
            codigo: obtenerTexto(prestamo, ["codigo", "codigoPrestamo", "id"], "PR-" + String(indice + 1).padStart(3, "0")),
            usuario: esExterno ? (nombreExterno || "Usuario externo") : obtenerTexto(prestamo, ["usuario", "nombreUsuario", "nombreCompleto"], "Usuario no indicado"),
            tipo: esExterno ? tipoExterno : obtenerTexto(prestamo, ["tipo", "tipoUsuario"], "Usuario"),
            libro: esExterno ? obtenerTexto(prestamo, ["tituloLibro"], "Libro no indicado") : obtenerTexto(prestamo, ["libro", "tituloLibro", "titulo"], "Libro no indicado"),
            fechaPrestamo: obtenerTexto(prestamo, ["fechaPrestamo", "fecha_prestamo", "fechaRegistro"], ""),
            fechaDevolucion: obtenerTexto(prestamo, ["fechaDevolucion", "fecha_devolucion", "fechaLimite"], ""),
            estado: estaDevuelto(prestamo) ? "Devuelto" : (prestamoVencido(prestamo) ? "Vencido" : "Activo")
        };
    }

    function mostrarPrestamosRecientes(prestamos) {
        const cuerpo = document.getElementById("cuerpoPrestamosAdministrador");
        if (!cuerpo) return;

        cuerpo.replaceChildren();
        const recientes = prestamos.map(normalizarPrestamo).sort(function (a, b) {
            const fechaA = crearFecha(a.fechaPrestamo);
            const fechaB = crearFecha(b.fechaPrestamo);
            return (fechaB ? fechaB.getTime() : 0) - (fechaA ? fechaA.getTime() : 0);
        }).slice(0, 5);

        if (recientes.length === 0) {
            const fila = document.createElement("tr");
            const celda = crearCelda("Todavía no hay préstamos registrados.");
            celda.colSpan = 6;
            fila.appendChild(celda);
            cuerpo.appendChild(fila);
            return;
        }

        recientes.forEach(function (prestamo) {
            const fila = document.createElement("tr");
            fila.appendChild(crearCelda(prestamo.codigo));
            fila.appendChild(crearCeldaUsuario(prestamo.usuario, prestamo.tipo));
            fila.appendChild(crearCelda(prestamo.libro));
            fila.appendChild(crearCelda(formatearFecha(prestamo.fechaPrestamo)));
            fila.appendChild(crearCelda(formatearFecha(prestamo.fechaDevolucion)));
            fila.appendChild(crearCeldaEstado(prestamo.estado));
            cuerpo.appendChild(fila);
        });
    }

    function mostrarCategorias(libros) {
        const filas = Array.from(document.querySelectorAll(".panel.categorias .categoria"));
        if (filas.length === 0) return;

        const cantidades = {};
        libros.forEach(function (libro) {
            const categoria = obtenerTexto(libro, ["categoria", "programa", "area"], "Otros");
            const cantidad = Number(libro.ejemplares || libro.cantidad || libro.stock || 1);
            cantidades[categoria] = (cantidades[categoria] || 0) + (Number.isFinite(cantidad) ? cantidad : 1);
        });

        const categoriasOrdenadas = Object.entries(cantidades).sort(function (a, b) {
            return b[1] - a[1];
        });
        const principales = categoriasOrdenadas.slice(0, Math.max(filas.length - 1, 0));
        const cantidadOtros = categoriasOrdenadas.slice(principales.length).reduce(function (total, categoria) {
            return total + categoria[1];
        }, 0);
        const datos = principales.concat([["Otros", cantidadOtros]]);
        const cantidadMayor = datos.reduce(function (mayor, categoria) {
            return Math.max(mayor, categoria[1]);
        }, 1);

        filas.forEach(function (fila, indice) {
            const dato = datos[indice] || [indice === filas.length - 1 ? "Otros" : "Sin registros", 0];
            const nombre = fila.querySelector(".categoria-info span");
            const total = fila.querySelector(".categoria-info strong");
            const barra = fila.querySelector(".progreso-barra");
            if (nombre) nombre.textContent = dato[0];
            if (total) total.textContent = dato[1];
            if (barra) barra.style.width = Math.round((dato[1] / cantidadMayor) * 100) + "%";
        });
    }

    function actualizarDashboard() {
        const libros = obtenerDatos("bibliotecaLibros");
        const usuarios = obtenerDatos("bibliotecaUsuarios");
        const prestamos = obtenerDatos("bibliotecaPrestamos");
        const prestamosExternos = obtenerDatos("bibliotecaPrestamosExternos");
        const todosLosPrestamos = prestamos.concat(prestamosExternos);
        const prestamosActivos = todosLosPrestamos.filter(function (prestamo) {
            return !estaDevuelto(prestamo);
        });

        colocarTexto("saludoAdministrador", obtenerSaludo(new Date().getHours()));
        colocarTexto("totalLibrosAdministrador", sumarEjemplares(libros));
        colocarTexto("totalUsuariosAdministrador", usuarios.length);
        colocarTexto("totalPrestamosAdministrador", prestamosActivos.length);
        colocarTexto("totalVencidosAdministrador", prestamosActivos.filter(prestamoVencido).length);
        mostrarCategorias(libros);
        mostrarPrestamosRecientes(todosLosPrestamos);
    }

    function cerrarSesion() {
        sessionStorage.removeItem("adminAutenticado");
        sessionStorage.removeItem("nombreAdministrador");
        localStorage.removeItem("recordarAdministrador");
    }

    const botonCerrarSesion = document.getElementById("cerrarSesionAdministrador");
    if (botonCerrarSesion) botonCerrarSesion.addEventListener("click", cerrarSesion);

    window.addEventListener("pageshow", actualizarDashboard);
    window.addEventListener("storage", function (evento) {
        if (claves.includes(evento.key)) actualizarDashboard();
    });

    actualizarDashboard();
});
