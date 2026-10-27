<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'sistema_biblioteca';
// Cuenta limitada exclusivamente a la base de datos de la biblioteca.
const DB_USER = 'biblioteca_app';
const DB_PASSWORD = 'BibliotecaCMVO2026!';

function db(): mysqli {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $db = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    $db->set_charset('utf8mb4');
    return $db;
}

function responder(array $datos, int $estado = 200): never {
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
