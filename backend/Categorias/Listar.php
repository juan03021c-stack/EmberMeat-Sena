<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../Config/Database.php";

try {
    $sentencia = $pdo->query("SELECT id, nombre, descripcion, activa FROM categorias ORDER BY nombre ASC");
    $categorias = $sentencia->fetchAll();

    echo json_encode([
        "success" => true,
        "categorias" => $categorias
    ]);
} catch (Throwable $error) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener categorías: " . $error->getMessage()
    ]);
}
