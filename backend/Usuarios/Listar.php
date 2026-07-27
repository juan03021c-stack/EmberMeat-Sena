<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../Config/Database.php";

try {
    $stmt = $pdo->query(
        "SELECT u.*, r.nombre AS rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         ORDER BY u.id DESC"
    );

    $usuarios = $stmt->fetchAll();
    echo json_encode(["success" => true, "usuarios" => $usuarios]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener usuarios: " . $e->getMessage()
    ]);
}
