<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

require_once "../Config/Database.php";

try {
    $stmt = $pdo->query(
        "SELECT p.*, c.nombre AS categoria_nombre
         FROM productos p
         LEFT JOIN categorias c ON p.categoria_id = c.id
         ORDER BY p.id ASC"
    );

    $productos = $stmt->fetchAll();
    echo json_encode(["success" => true, "productos" => $productos]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener productos: " . $e->getMessage()
    ]);
}