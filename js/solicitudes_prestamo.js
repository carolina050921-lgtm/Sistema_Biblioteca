(function () {
    "use strict";
    function leer(clave) {
        const datos = JSON.parse(localStorage.getItem(clave) || "[]");
        if (!Array.isArray(datos)) throw new Error("No se pudieron leer los registros de biblioteca.");
        return datos;
    }
    function fecha(dia) {
        return dia.getFullYear() + "-" + String(dia.getMonth() + 1).padStart(2, "0") + "-" + String(dia.getDate()).padStart(2, "0");
    }
    function limites() {
        const hoy = new Date();
        const maxima = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3);
        return { min: fecha(hoy), max: fecha(maxima) };
    }
    function codigo(libro) { return String(libro.codigo || libro.titulo || libro.nombre); }
    function propias(tipo, nombre) {
        return leer("bibliotecaSolicitudesPrestamo").filter(s => s.tipo === tipo && (s[tipo === "Docente" ? "docente" : "estudiante"] || s.usuario) === nombre && ["Pendiente", "Aprobada"].includes(s.estado));
    }
    function existente(libro, tipo, nombre) { return propias(tipo, nombre).find(s => s.codigoLibro === codigo(libro)); }
    function disponible(libro) {
        const actual = leer("bibliotecaLibros").find(item => codigo(item) === codigo(libro)) || libro;
        if (actual.modalidad === "Consulta interna") return false;
        if (actual.estado && actual.estado !== "Disponible") return false;
        return Number(actual.disponibles ?? actual.ejemplares ?? actual.cantidad ?? 0) > 0;
    }
    async function enviar(libro, tipo, nombre, recojo, motivo, observacion, programa = "", semestre = "") {
        if (!programa.trim()) throw new Error("Selecciona tu programa de estudios.");
        if (!["I", "II", "III", "IV", "V", "VI"].includes(semestre)) throw new Error("Selecciona el semestre del I al VI.");
        const rango = limites();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(recojo) || recojo < rango.min || recojo > rango.max) throw new Error("Elige una fecha de recojo entre hoy y los próximos 3 días.");
        if (!motivo.trim()) throw new Error("Selecciona el uso del material.");
        if (!disponible(libro)) throw new Error("Este libro no está disponible para préstamo externo.");
        if (existente(libro, tipo, nombre)) throw new Error("Ya tienes una solicitud pendiente o aprobada para este libro.");
        const activos = leer("bibliotecaPrestamos").filter(p => p.tipo === tipo && (p[tipo === "Docente" ? "docente" : "estudiante"] || p.usuario) === nombre && p.estado !== "Devuelto");
        if (tipo === "Docente" && activos.length + propias(tipo, nombre).length >= 5) throw new Error("No puedes superar el límite de 5 préstamos o solicitudes activas para docentes.");
        const solicitudes = leer("bibliotecaSolicitudesPrestamo");
        const solicitud = {
            codigoSolicitud: "SOL-" + (tipo === "Docente" ? "DOC-" : "EST-") + crypto.randomUUID(),
            codigoLibro: codigo(libro), libro: libro.titulo || libro.nombre,
            tipo, [tipo === "Docente" ? "docente" : "estudiante"]: nombre,
            fechaSolicitud: rango.min, fechaRecojo: recojo, diasPrestamo: 14,
            programa: programa.trim(), semestre,
            motivo: motivo.trim(), observacion: observacion.trim().slice(0, 250), estado: "Pendiente"
        };
        await BibliotecaAPI.guardar("solicitudes", {...solicitud, usuario:nombre});
        solicitudes.push(solicitud);
        localStorage.setItem("bibliotecaSolicitudesPrestamo", JSON.stringify(solicitudes));
        return solicitud;
    }
    window.solicitudesPrestamo = { enviar, existente, disponible, limites };
}());
