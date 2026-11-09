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
        WHERE estado = 'pendiente' OR estado = 'en_preparacion' OR estado = 'listo_para_entrega' OR estado = 'en_camino' OR  estado = 'intento_fallido' ;"
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
    WHERE p.created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
    AND p.created_at < CURRENT_DATE + INTERVAL 1 DAY
    GROUP BY DATE(p.created_at)
    ORDER BY DATE(p.created_at);"
    )->fetchAll(PDO::FETCH_KEY_PAIR);

    /* Gráfica del mes actual: un punto por cada día desde el 1 hasta hoy (0 si no hubo ventas); el mes siguiente arranca de nuevo */
    $hoy = new DateTime($pdo->query("SELECT CURRENT_DATE")->fetchColumn());
    $dia = new DateTime($hoy->format('Y-m-01'));
    $ventasDelMes = [];
    while ($dia <= $hoy) {
        $fecha = $dia->format('Y-m-d');
        $ventasDelMes[] = ['date' => $fecha, 'sales' => (float)($ventasPorDia[$fecha] ?? 0)];
        $dia->modify('+1 day');
    }
    $ventasPorDia = $ventasDelMes;

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