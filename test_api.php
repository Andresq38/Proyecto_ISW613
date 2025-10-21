<?php
// Establecer todos los encabezados necesarios
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// Verificar que Apache y PHP funcionan
echo json_encode([
    "status" => "success",
    "message" => "API funcionando correctamente",
    "server" => [
        "software" => $_SERVER['SERVER_SOFTWARE'],
        "php_version" => PHP_VERSION,
        "document_root" => $_SERVER['DOCUMENT_ROOT'],
        "script_filename" => $_SERVER['SCRIPT_FILENAME']
    ]
]);