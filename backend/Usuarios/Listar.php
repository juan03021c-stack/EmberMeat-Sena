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
    // Solo columnas públicas: nunca la contraseña cifrada ni el código de recuperación
    $sql = "SELECT u.id, u.rol_id, u.nombre, u.correo, u.cedula, u.telefono,
                   u.activo, u.created_at, r.nombre AS rol_nombre
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

    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "usuarios" => $usuarios]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener usuarios: " . $e->getMessage()
    ]);
}
