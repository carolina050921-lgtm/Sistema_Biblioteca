document.addEventListener("DOMContentLoaded", function () {
    const buscar = document.getElementById("buscarPrestamo");
    const filtroVencimiento = document.getElementById("filtroVencimiento");
    const filtroTipo = document.getElementById("filtroTipo");
    const unDia = 24 * 60 * 60 * 1000;

    function leer(clave) {
        try { return JSON.parse(localStorage.getItem(clave)) || []; }
        catch (error) { return []; }
    }

    function escapar(valor) {
        return String(valor || "").replace(/[&<>'"]/g, function (caracter) {
            return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[caracter];
        });
    }

    function fechaLocal(valor) {
        if (!valor) return null;
        const partes = valor.split("-").map(Number);
        if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
        return new Date(partes[0], partes[1] - 1, partes[2]);
    }

    function diferenciaDias(fecha) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return Math.round((fecha - hoy) / unDia);
    }

    function clasificar(dias) {
        if (dias < 0) return { estado: "Vencido", clase: "vencido", tiempo: "Hace " + Math.abs(dias) + (Math.abs(dias) === 1 ? " día" : " días") };
        if (dias === 0) return { estado: "Vence hoy", clase: "hoy", tiempo: "Hoy" };
        if (dias === 1) return { estado: "Vence mañana", clase: "manana", tiempo: "1 día" };
        return { estado: "Próximo", clase: "proximo", tiempo: dias + " días" };
    }

    function obtenerPrestamos() {
        const normales = leer("bibliotecaPrestamos").map(function (item) {
            return { codigo: item.codigo, documento: item.documento || item.dni || "", usuario: item.usuario, tipo: item.tipo, libro: item.libro, fechaDevolucion: item.fechaDevolucion, estadoOriginal: item.estado || "Activo" };
        });
        const externos = leer("bibliotecaPrestamosExternos").map(function (item, indice) {
            return { codigo: item.codigo || "PE-" + String(indice + 1).padStart(3, "0"), documento: item.documento, usuario: (item.nombres + " " + item.apellidos).trim(), tipo: item.tipo === "visitante" ? "Visitante autorizado" : "Personal administrativo", libro: item.tituloLibro, fechaDevolucion: item.fechaDevolucion, estadoOriginal: item.estado || "Activo" };
        });

        return normales.concat(externos).map(function (item) {
            const fecha = fechaLocal(item.fechaDevolucion);
            if (!fecha || String(item.estadoOriginal).toLowerCase() === "devuelto") return null;
            const dias = diferenciaDias(fecha);
            if (dias > 3) return null;
            return Object.assign({}, item, { dias: dias }, clasificar(dias));
        }).filter(Boolean).sort(function (a, b) { return a.dias - b.dias; });
    }

    function renderizar() {
        const prestamos = obtenerPrestamos();
        const texto = buscar.value.trim().toLowerCase();
        const filtrados = prestamos.filter(function (item) {
            const coincideTexto = !texto || [item.codigo, item.documento, item.usuario, item.libro].some(function (valor) { return String(valor || "").toLowerCase().includes(texto); });
            return coincideTexto && (!filtroVencimiento.value || item.estado === filtroVencimiento.value) && (!filtroTipo.value || item.tipo === filtroTipo.value);
        });

        document.getElementById("totalVencidos").textContent = prestamos.filter(function (item) { return item.estado === "Vencido"; }).length;
        document.getElementById("totalHoy").textContent = prestamos.filter(function (item) { return item.estado === "Vence hoy"; }).length;
        document.getElementById("totalManana").textContent = prestamos.filter(function (item) { return item.estado === "Vence mañana"; }).length;
        document.getElementById("totalProximos").textContent = prestamos.filter(function (item) { return item.estado === "Próximo"; }).length;

        document.getElementById("tablaVencimientos").innerHTML = filtrados.length ? filtrados.map(function (item) {
            return `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.documento) || "-"}</td><td>${escapar(item.usuario)}</td><td><span class="tipo">${escapar(item.tipo)}</span></td><td>${escapar(item.libro)}</td><td>${escapar(item.fechaDevolucion)}</td><td><span class="tiempo">${escapar(item.tiempo)}</span></td><td><span class="estado ${item.clase}">${escapar(item.estado)}</span></td><td><a class="accion" href="devoluciones.html">Registrar devolución</a></td></tr>`;
        }).join("") : '<tr><td class="vacio" colspan="9">No hay préstamos vencidos o próximos a vencer con los filtros seleccionados.</td></tr>';
    }

    buscar.addEventListener("input", renderizar);
    filtroVencimiento.addEventListener("change", renderizar);
    filtroTipo.addEventListener("change", renderizar);
    window.addEventListener("storage", renderizar);
    renderizar();
});
