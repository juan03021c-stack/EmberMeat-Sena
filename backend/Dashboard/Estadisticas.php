<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Config/Database.php";
try {
    $productos = $pdo->query(
        "SELECT COUNT(*) FROM productos"
    )->fetchColumn();

    $usuarios = $pdo->query(
        "SELECT COUNT(*) FROM usuarios"
    )->fetchColumn();

    $pedidos = $pdo->query(
        "SELECT COUNT(*) FROM pedidos 
        WHERE estado = 'en_preparacion' 
        OR estado = 'pendiente';"
    )->fetchColumn();

    $totalVentas = $pdo->query(
        "SELECT SUM(total) FROM pedidos"
    )->fetchColumn();

    $pendientes = $pdo->query(
        "SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente'"
    )->fetchColumn();

    $enviados = $pdo->query(
        "SELECT COUNT(*) FROM pedidos WHERE estado = 'enviado'"
    )->fetchColumn();

    $entregados = $pdo->query(
        "SELECT COUNT(*) FROM pedidos WHERE estado = 'entregado'"
    )->fetchColumn();

    $stockBajo = $pdo->query(
        "SELECT COUNT(*) FROM productos WHERE stock <= 5"
    )->fetchColumn();

    $ventasPorDia = $pdo->query(
        "SELECT
    DATE(p.created_at) AS date,
    SUM(p.total) AS sales
    FROM pedidos p
    WHERE p.created_at >= CURRENT_DATE - INTERVAL 29 DAY
    AND p.created_at < CURRENT_DATE + INTERVAL 1 DAY
    GROUP BY DATE(p.created_at)
    ORDER BY DATE(p.created_at);"
    )->fetchAll(PDO::FETCH_ASSOC);

    $pedidosRecientes = $pdo->query(
        "SELECT
    p.id,
    p.numero_pedido AS numero,
    u.nombre AS customer,
    p.created_at AS date,
    p.total,
    p.estado AS status
    FROM pedidos p
    INNER JOIN usuarios u
        ON p.cliente_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 5;"
    )->fetchAll(PDO::FETCH_ASSOC);



    echo json_encode([
        "success" => true,
        "productos" => $productos,
        "usuarios" => $usuarios,
        "pedidos" => $pedidos,
        "totalVentas" => $totalVentas,
        "pendientes" => $pendientes,
        "enviados" => $enviados,
        "entregados" => $entregados,
        "stockBajo" => $stockBajo,
        "ventasPorDia" => $ventasPorDia,
        "pedidosRecientes" => $pedidosRecientes
    ]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener estadísticas: " . $e->getMessage()
    ]);
}
