<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Config/Database.php";

try {
    $stmt = $pdo->query(
        /* Consulta para obtener los pedidos con cliente, repartidor y dirección */
        "SELECT 
            p.*,
            u.nombre AS cliente,
            rep.nombre AS repartidor,
            dc.direccion AS direccion_del_cliente
        FROM pedidos AS p
        LEFT JOIN usuarios AS u 
            ON p.cliente_id = u.id
        LEFT JOIN usuarios AS rep 
            ON p.repartidor_id = rep.id
        LEFT JOIN direcciones_cliente AS dc
            ON p.direccion_id = dc.id
        ORDER BY p.id DESC;"
    );

    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "pedidos" => $pedidos]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener pedidos: " . $e->getMessage()
    ]);
}
