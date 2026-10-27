(function () {
    const normalizar = valor => String(valor || "").trim().toLocaleLowerCase("es");
    window.esLibroActual = function (libro) {
        return (window.bibliotecaLibrosPortadas || []).some(actual => actual.codigo === libro.codigo || normalizar(actual.titulo) === normalizar(libro.titulo) || actual.portada === libro.portada);
    };
    window.esRegistroActual = function (registro) {
        const fecha = registro.fechaSolicitud || registro.fechaPrestamo || "";
        return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= "2026-10-15" && (window.bibliotecaLibrosPortadas || []).some(libro => registro.codigoLibro === libro.codigo || normalizar(registro.libro) === normalizar(libro.titulo));
    };
}());
