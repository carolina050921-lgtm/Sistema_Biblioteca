<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') responder(['ok' => true]);
try {
    $entrada = json_decode(file_get_contents('php://input'), true) ?: [];
    $recurso = $_GET['recurso'] ?? '';
    $metodo = $_SERVER['REQUEST_METHOD'];
    $db = db();

    $mapa = [
        'usuarios' => ['tabla' => 'usuarios', 'campos' => ['tipo','nombres','apellidos','dni','codigo','correo','telefono','nacimiento','genero','programa','ciclo','direccion','foto','estado','fecha_registro']],
        'libros' => ['tabla' => 'libros', 'campos' => ['codigo','titulo','autor','anio','editorial','edicion','isbn','categoria','ejemplares','disponibles','disponibilidad','ubicacion','adquisicion','procedencia','modalidad','estado','resumen','portada','fecha_registro']],
        'prestamos' => ['tabla' => 'prestamos', 'campos' => ['usuario_id','libro_id','codigo','origen','tipo_usuario','usuario','documento','nombres','apellidos','telefono','area','direccion','codigo_libro','titulo_libro','ejemplar','fecha_prestamo','fecha_devolucion','modalidad','observaciones','estado','fecha_devolucion_real','estado_fisico','cumplimiento','observaciones_devolucion']],
        'solicitudes' => ['tabla' => 'solicitudes_prestamo', 'campos' => ['usuario_id','libro_id','codigo_solicitud','codigo_libro','libro','tipo','usuario','fecha_solicitud','fecha_recojo','dias_prestamo','programa','semestre','motivo','observacion','estado','fecha_aprobacion']],
        'devoluciones' => ['tabla' => 'devoluciones', 'campos' => ['prestamo_id','fecha_devolucion_real','estado_fisico','cumplimiento','observaciones']],
    ];
    if (!isset($mapa[$recurso])) responder(['ok' => false, 'mensaje' => 'Recurso no válido.'], 404);
    $config = $mapa[$recurso];

    if ($recurso === 'solicitudes' && $metodo === 'PUT' && ($entrada['accion'] ?? '') === 'aprobar') {
        $codigo = (string)($entrada['codigo_solicitud'] ?? '');
        $fecha = (string)($entrada['fecha_aprobacion'] ?? '');
        if ($codigo === '' || $fecha === '') responder(['ok' => false, 'mensaje' => 'Datos de solicitud no válidos.'], 422);
        $stmt = $db->prepare("UPDATE solicitudes_prestamo SET estado = 'Aprobada', fecha_aprobacion = ? WHERE codigo_solicitud = ?");
        $stmt->bind_param('ss', $fecha, $codigo); $stmt->execute();
        if ($stmt->affected_rows < 1) responder(['ok' => false, 'mensaje' => 'No se encontró la solicitud en MySQL.'], 404);
        responder(['ok' => true]);
    }

    if ($recurso === 'prestamos' && $metodo === 'PUT' && ($entrada['accion'] ?? '') === 'devolver') {
        $id = (int)($entrada['id'] ?? 0);
        if ($id < 1) responder(['ok' => false, 'mensaje' => 'Préstamo no válido.'], 422);
        $db->begin_transaction();
        $stmt = $db->prepare('UPDATE prestamos SET estado = ?, fecha_devolucion_real = ?, estado_fisico = ?, cumplimiento = ?, observaciones_devolucion = ? WHERE id = ? AND estado <> \'Devuelto\'');
        $estado = 'Devuelto'; $fecha = (string)($entrada['fecha_devolucion_real'] ?? ''); $fisico = (string)($entrada['estado_fisico'] ?? ''); $cumplimiento = (string)($entrada['cumplimiento'] ?? ''); $observaciones = (string)($entrada['observaciones_devolucion'] ?? '');
        $stmt->bind_param('sssssi', $estado, $fecha, $fisico, $cumplimiento, $observaciones, $id); $stmt->execute();
        if ($stmt->affected_rows !== 1) { $db->rollback(); responder(['ok' => false, 'mensaje' => 'El préstamo ya fue devuelto o no existe.'], 409); }
        $registro = $db->prepare('INSERT INTO devoluciones (prestamo_id, fecha_devolucion_real, estado_fisico, cumplimiento, observaciones) VALUES (?, ?, ?, ?, ?)');
        $registro->bind_param('issss', $id, $fecha, $fisico, $cumplimiento, $observaciones); $registro->execute(); $db->commit();
        responder(['ok' => true]);
    }

    if ($metodo === 'GET') {
        $orden = $recurso === 'prestamos' ? 'id DESC' : 'id DESC';
        $resultado = $db->query("SELECT * FROM `{$config['tabla']}` ORDER BY $orden");
        responder(['ok' => true, 'datos' => $resultado->fetch_all(MYSQLI_ASSOC)]);
    }
    if ($metodo !== 'POST') responder(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
    $datos = is_array($entrada['datos'] ?? null) ? $entrada['datos'] : [];
    if (in_array($recurso, ['prestamos', 'solicitudes'], true)) {
        if (!empty($datos['codigo_libro'])) { $s = $db->prepare('SELECT id FROM libros WHERE codigo = ?'); $s->bind_param('s', $datos['codigo_libro']); $s->execute(); $fila = $s->get_result()->fetch_assoc(); if ($fila) $datos['libro_id'] = $fila['id']; }
        $nombre = $datos['usuario'] ?? trim(($datos['nombres'] ?? '') . ' ' . ($datos['apellidos'] ?? ''));
        if ($nombre !== '') { $s = $db->prepare("SELECT id FROM usuarios WHERE CONCAT(nombres, ' ', apellidos) = ? LIMIT 1"); $s->bind_param('s', $nombre); $s->execute(); $fila = $s->get_result()->fetch_assoc(); if ($fila) $datos['usuario_id'] = $fila['id']; }
    }
    $campos = array_values(array_filter($config['campos'], fn($campo) => array_key_exists($campo, $datos)));
    if (!$campos) responder(['ok' => false, 'mensaje' => 'No se recibieron datos para guardar.'], 422);
    $marcas = implode(',', array_fill(0, count($campos), '?'));
    $sql = "INSERT INTO `{$config['tabla']}` (`" . implode('`,`', $campos) . "`) VALUES ($marcas)";
    $stmt = $db->prepare($sql);
    $tipos = str_repeat('s', count($campos));
    $valores = array_map(fn($campo) => is_bool($datos[$campo]) ? (int)$datos[$campo] : (string)$datos[$campo], $campos);
    $stmt->bind_param($tipos, ...$valores);
    $stmt->execute();
    $datos['id'] = $db->insert_id;
    responder(['ok' => true, 'dato' => $datos], 201);
} catch (mysqli_sql_exception $error) {
    $mensaje = $error->getCode() === 1062 ? 'Ya existe un registro con esos datos únicos.' : 'No se pudo guardar el registro en la base de datos.';
    responder(['ok' => false, 'mensaje' => $mensaje], 500);
} catch (Throwable $error) {
    responder(['ok' => false, 'mensaje' => 'No fue posible conectar con la base de datos.'], 500);
}
