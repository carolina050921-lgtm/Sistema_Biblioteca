window.BibliotecaAPI = (() => {
    const base = 'http://localhost/sistema_biblioteca_api/index.php';
    const nombres = { usuarios:'bibliotecaUsuarios', libros:'bibliotecaLibros', prestamos:'bibliotecaPrestamos', solicitudes:'bibliotecaSolicitudesPrestamo' };
    const normalizar = (recurso, dato) => {
        const claves = { fechaRegistro:'fecha_registro', fechaPrestamo:'fecha_prestamo', fechaDevolucion:'fecha_devolucion', fechaDevolucionReal:'fecha_devolucion_real', fechaAprobacion:'fecha_aprobacion', estadoFisico:'estado_fisico', observacionesDevolucion:'observaciones_devolucion', codigoLibro:'codigo_libro', tituloLibro:'titulo_libro', tipoUsuario:'tipo_usuario', codigoSolicitud:'codigo_solicitud' };
        const resultado = {};
        Object.entries(dato).forEach(([clave, valor]) => {
            const campo = claves[clave] || clave;
            resultado[campo] = campo === 'fecha_registro' && /^\d{2}\/\d{2}\/\d{4}$/.test(valor) ? valor.split('/').reverse().join('-') : valor;
        });
        return resultado;
    };
    async function guardar(recurso, dato) {
        const respuesta = await fetch(`${base}?recurso=${encodeURIComponent(recurso)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({datos:normalizar(recurso, dato)}) });
        const cuerpo = await respuesta.json(); if (!respuesta.ok || !cuerpo.ok) throw new Error(cuerpo.mensaje || 'No se pudo guardar el registro.'); return cuerpo.dato;
    }
    async function listar(recurso) {
        const respuesta = await fetch(`${base}?recurso=${encodeURIComponent(recurso)}`); const cuerpo = await respuesta.json(); if (!respuesta.ok || !cuerpo.ok) throw new Error(cuerpo.mensaje || 'No se pudieron consultar los registros.'); return cuerpo.datos;
    }
    async function aprobarSolicitud(codigoSolicitud, fechaAprobacion) {
        const respuesta = await fetch(`${base}?recurso=solicitudes`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({accion:'aprobar', codigo_solicitud:codigoSolicitud, fecha_aprobacion:fechaAprobacion}) });
        const cuerpo = await respuesta.json(); if (!respuesta.ok || !cuerpo.ok) throw new Error(cuerpo.mensaje || 'No se pudo aprobar la solicitud.');
    }
    async function guardarSiNoExiste(recurso, dato) {
        try { return await guardar(recurso, dato); }
        catch (error) {
            if (error.message.includes('Ya existe')) return null;
            throw error;
        }
    }
    async function migrarRegistrosLocales() {
        const leer = clave => { try { const datos = JSON.parse(localStorage.getItem(clave) || '[]'); return Array.isArray(datos) ? datos : []; } catch (_) { return []; } };
        const usuarios = leer('bibliotecaUsuarios');
        const libros = leer('bibliotecaLibros');
        const prestamosNormales = leer('bibliotecaPrestamos');
        const prestamosExternos = leer('bibliotecaPrestamosExternos');
        const solicitudes = leer('bibliotecaSolicitudesPrestamo');
        for (const usuario of usuarios) await guardarSiNoExiste('usuarios', usuario);
        for (const libro of libros) await guardarSiNoExiste('libros', libro);
        for (let indice = 0; indice < prestamosNormales.length; indice++) {
            const item = prestamosNormales[indice];
            const guardado = await guardarSiNoExiste('prestamos', { codigo:item.codigo || `PR-MIG-${indice + 1}`, origen:'normal', tipoUsuario:item.tipo, usuario:item.usuario, documento:item.documento || '', codigoLibro:item.codigoLibro || '', tituloLibro:item.tituloLibro || item.libro, ejemplar:item.ejemplar || '', fechaPrestamo:item.fechaPrestamo, fechaDevolucion:item.fechaDevolucion, modalidad:item.modalidad || '', observaciones:item.observaciones || '', estado:item.estado || 'Activo', ...(item.fechaDevolucionReal ? {fechaDevolucionReal:item.fechaDevolucionReal} : {}), estadoFisico:item.estadoFisico || '', cumplimiento:item.cumplimiento || '', observacionesDevolucion:item.observacionesDevolucion || '' });
            if (guardado && item.estado === 'Devuelto') await guardarSiNoExiste('devoluciones', { prestamo_id:guardado.id, fecha_devolucion_real:item.fechaDevolucionReal, estado_fisico:item.estadoFisico || '', cumplimiento:item.cumplimiento || '', observaciones:item.observacionesDevolucion || '' });
        }
        for (let indice = 0; indice < prestamosExternos.length; indice++) {
            const item = prestamosExternos[indice];
            const guardado = await guardarSiNoExiste('prestamos', { codigo:item.codigo || `PE-MIG-${Date.now()}-${indice + 1}`, origen:'externo', tipoUsuario:item.tipo, documento:item.documento, nombres:item.nombres, apellidos:item.apellidos, telefono:item.telefono || '', area:item.area || '', direccion:item.direccion || '', codigoLibro:item.codigoLibro || '', tituloLibro:item.tituloLibro, ejemplar:item.ejemplar || '', fechaPrestamo:item.fechaPrestamo, fechaDevolucion:item.fechaDevolucion, modalidad:item.modalidad || '', observaciones:item.observaciones || '', estado:item.estado || 'Activo', ...(item.fechaDevolucionReal ? {fechaDevolucionReal:item.fechaDevolucionReal} : {}), estadoFisico:item.estadoFisico || '', cumplimiento:item.cumplimiento || '', observacionesDevolucion:item.observacionesDevolucion || '' });
            if (guardado && item.estado === 'Devuelto') await guardarSiNoExiste('devoluciones', { prestamo_id:guardado.id, fecha_devolucion_real:item.fechaDevolucionReal, estado_fisico:item.estadoFisico || '', cumplimiento:item.cumplimiento || '', observaciones:item.observacionesDevolucion || '' });
        }
        for (const solicitud of solicitudes) await guardarSiNoExiste('solicitudes', {...solicitud, usuario:solicitud.usuario || solicitud.estudiante || solicitud.docente || ''});
    }
    const iniciarMigracion = () => migrarRegistrosLocales().catch(error => console.error('No se pudieron migrar los registros locales:', error));
    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', iniciarMigracion);
    else iniciarMigracion();
    return { guardar, listar, aprobarSolicitud, nombres, migrarRegistrosLocales };
})();
