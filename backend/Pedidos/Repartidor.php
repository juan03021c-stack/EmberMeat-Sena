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
            p.id,
            p.numero_pedido,

            u.nombre AS nombre_cliente,
            u.telefono AS telefono_cliente,

            COALESCE(
                NULLIF(TRIM(p.direccion_entrega), ''),
                dc.direccion
            ) AS direccion_entrega,

            dc.barrio,
            dc.ciudad,
            dc.instrucciones,

            p.modalidad_entrega,

            GROUP_CONCAT(
                CONCAT(
                    pi.nombre_producto,
                    ' (x',
                    pi.cantidad,
                    ')'
                )
                ORDER BY pi.nombre_producto
                SEPARATOR ', '
            ) AS productos,

            SUM(pi.cantidad) AS cantidad_total_productos,

            p.total,

            p.estado,

            p.hora_estimada_entrega,
            p.observacion_entrega,

            p.created_at AS fecha_pedido

        FROM pedidos p

        LEFT JOIN usuarios u
            ON p.cliente_id = u.id

        LEFT JOIN direcciones_cliente dc
            ON p.direccion_id = dc.id

        LEFT JOIN pedido_items pi
            ON p.id = pi.pedido_id

        GROUP BY
            p.id,
            p.numero_pedido,
            u.nombre,
            u.telefono,
            p.direccion_entrega,
            dc.direccion,
            dc.barrio,
            dc.ciudad,
            dc.instrucciones,
            p.modalidad_entrega,
            p.total,
            p.estado,
            p.hora_estimada_entrega,
            p.observacion_entrega,
            p.created_at

        ORDER BY p.created_at DESC;"
    );

    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "pedidos" => $pedidos]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener pedidos: " . $e->getMessage()
    ]);
}
