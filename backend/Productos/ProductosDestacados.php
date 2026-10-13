<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

require_once "../Config/Database.php";

try {
    $stmt = $pdo->query(
    "SELECT
    p.id,
    p.nombre,
    p.precio,
    p.imagen_url,
    p.stock,
    p.descripcion,
    p.presentacion,
    p.activo AS disponible,
    c.nombre AS categoria_nombre,
    SUM(pi.cantidad) AS unidades_vendidas
FROM productos p
INNER JOIN pedido_items pi
    ON pi.producto_id = p.id
INNER JOIN pedidos pe
    ON pe.id = pi.pedido_id
INNER JOIN categorias c
    ON p.categoria_id = c.id
WHERE pe.estado = 'pendiente'
GROUP BY
    p.id,
    p.nombre,
    p.precio,
    p.imagen_url
ORDER BY unidades_vendidas DESC
LIMIT 8;
;"
    );

    $productos = $stmt->fetchAll();
    echo json_encode(["success" => true, "productos" => $productos]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener productos: " . $e->getMessage()
    ]);
}
