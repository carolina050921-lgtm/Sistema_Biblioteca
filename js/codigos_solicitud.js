(function () {
    "use strict";
    window.codigoSolicitudVisible = function (solicitud) {
        const clave = "bibliotecaCodigosSolicitud";
        const codigos = JSON.parse(localStorage.getItem(clave) || "{}");
        const solicitudes = JSON.parse(localStorage.getItem("bibliotecaSolicitudesPrestamo") || "[]");
        let cambio = false;
        solicitudes.concat(solicitud).forEach(function (item) {
            if (!item.codigoSolicitud || codigos[item.codigoSolicitud]) return;
            const prefijo = item.tipo === "Docente" ? "SOL-DOC-" : "SOL-EST-";
            const ultimo = Object.values(codigos).reduce(function (maximo, codigo) {
                return codigo.startsWith(prefijo) ? Math.max(maximo, Number(codigo.slice(prefijo.length)) || 0) : maximo;
            }, 0);
            codigos[item.codigoSolicitud] = prefijo + String(ultimo + 1).padStart(4, "0");
            cambio = true;
        });
        if (cambio) localStorage.setItem(clave, JSON.stringify(codigos));
        return codigos[solicitud.codigoSolicitud] || solicitud.codigoSolicitud;
    };
}());
