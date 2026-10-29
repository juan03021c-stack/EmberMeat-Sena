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
    $sql = "SELECT u.*, r.nombre AS rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id";
    $params = [];

    // Filtro opcional por rol: Listar.php?rol=vendedor
    if (!empty($_GET['rol'])) {
        $sql .= " WHERE r.nombre = :rol";
        $params[':rol'] = $_GET['rol'];
    }

    $sql .= " ORDER BY u.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $usuarios = $stmt->fetchAll();
    echo json_encode(["success" => true, "usuarios" => $usuarios]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener usuarios: " . $e->getMessage()
    ]);
}