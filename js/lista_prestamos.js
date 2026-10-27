document.addEventListener("DOMContentLoaded", function () {
    const buscar = document.getElementById("buscarPrestamo");
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroEstado = document.getElementById("filtroEstado");

    function leer(clave) { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } }
    function escapar(valor) { return String(valor || "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
    function todos() {
        const normales = leer("bibliotecaPrestamos").map(item => ({ ...item, documento: item.documento || "", tipo: item.tipo, usuario: item.usuario, libro: item.libro, ejemplar: item.ejemplar || "-" }));
        const externos = leer("bibliotecaPrestamosExternos").map((item, indice) => ({ codigo: "PE-" + String(indice + 1).padStart(3,"0"), documento: item.documento, usuario: item.nombres + " " + item.apellidos, tipo: item.tipo === "visitante" ? "Visitante autorizado" : "Personal administrativo", libro: item.tituloLibro, ejemplar: item.ejemplar, fechaPrestamo: item.fechaPrestamo, fechaDevolucion: item.fechaDevolucion, estado: item.estado || "Activo" }));
        return normales.concat(externos).map(item => ({ ...item, estado: item.estado === "Activo" && item.fechaDevolucion && new Date(item.fechaDevolucion + "T23:59:59") < new Date() ? "Vencido" : item.estado }));
    }
    function renderizar() {
        const datos = todos(); const texto = buscar.value.trim().toLowerCase();
        const filtrados = datos.filter(item => (!texto || String(item.documento || "").toLowerCase().includes(texto) || String(item.usuario || "").toLowerCase().includes(texto)) && (!filtroTipo.value || item.tipo === filtroTipo.value) && (!filtroEstado.value || item.estado === filtroEstado.value));
        document.getElementById("totalPrestamos").textContent = datos.length;
        document.getElementById("totalActivos").textContent = datos.filter(item => item.estado === "Activo").length;
        document.getElementById("totalVencidos").textContent = datos.filter(item => item.estado === "Vencido").length;
        document.getElementById("totalResultados").textContent = filtrados.length;
        document.getElementById("tablaListaPrestamos").innerHTML = filtrados.length ? filtrados.slice().reverse().map(item => `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.documento) || "-"}</td><td>${escapar(item.usuario)}</td><td><span class="tipo">${escapar(item.tipo)}</span></td><td>${escapar(item.libro)}</td><td>${escapar(item.ejemplar)}</td><td>${escapar(item.fechaPrestamo)}</td><td>${escapar(item.fechaDevolucion)}</td><td><span class="estado ${item.estado === "Vencido" ? "vencido" : "activo"}">${escapar(item.estado)}</span></td></tr>`).join("") : '<tr><td class="vacio" colspan="9">No se encontraron préstamos registrados.</td></tr>';
    }
    buscar.addEventListener("input", renderizar); filtroTipo.addEventListener("change", renderizar); filtroEstado.addEventListener("change", renderizar); window.addEventListener("storage", renderizar); renderizar();
});
