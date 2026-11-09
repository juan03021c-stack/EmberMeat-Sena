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

/* --- Mes del reporte en formato AAAA-MM (por defecto el mes actual) --- */
$mes = $_GET['mes'] ?? date('Y-m');
if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $mes)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El mes no es válido."]);
    exit;
}
$inicio = $mes . '-01';
$fin = date('Y-m-d', strtotime($inicio . ' +1 month'));
$rango = [':inicio' => $inicio, ':fin' => $fin];

try {
    /* --- Dinero que entró: ventas registradas (pagos aprobados y cobros en el punto) --- */
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE created_at >= :inicio AND created_at < :fin"
    );
    $stmt->execute($rango);
    $ventas = $stmt->fetch(PDO::FETCH_ASSOC);

    /* --- Pedidos del mes agrupados por estado --- */
    $stmt = $pdo->prepare(
        "SELECT estado, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
         FROM pedidos
         WHERE created_at >= :inicio AND created_at < :fin
         GROUP BY estado
         ORDER BY cantidad DESC"
    );
    $stmt->execute($rango);
    $pedidosPorEstado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* --- Productos más vendidos según el detalle de las ventas --- */
    $stmt = $pdo->prepare(
        "SELECT vd.nombre, SUM(vd.cantidad) AS cantidad, SUM(vd.precio * vd.cantidad) AS total
         FROM venta_detalle vd
         INNER JOIN ventas v ON v.id = vd.venta_id
         WHERE v.created_at >= :inicio AND v.created_at < :fin
         GROUP BY vd.nombre
         ORDER BY cantidad DESC, total DESC
         LIMIT 10"
    );
    $stmt->execute($rango);
    $productosTop = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* --- Ventas por vendedor (sin vendedor = compras de la tienda en línea) --- */
    $stmt = $pdo->prepare(
        "SELECT COALESCE(u.nombre, 'Tienda en línea') AS vendedor,
                COUNT(*) AS cantidad, SUM(v.total) AS total
         FROM ventas v
         LEFT JOIN usuarios u ON u.id = v.vendedor_id
         WHERE v.created_at >= :inicio AND v.created_at < :fin
         GROUP BY vendedor
         ORDER BY total DESC"
    );
    $stmt->execute($rango);
    $ventasPorVendedor = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* --- Todos los repartidores, con sus entregas del mes y los pedidos que tienen en camino --- */
    $stmt = $pdo->prepare(
        "SELECT u.nombre AS repartidor,
                u.activo,
                (SELECT COUNT(*) FROM intentos_entrega ie
                  WHERE ie.repartidor_id = u.id AND ie.resultado = 'exitoso'
                    AND ie.created_at >= :inicio AND ie.created_at < :fin) AS exitosas,
                (SELECT COUNT(*) FROM intentos_entrega ie
                  WHERE ie.repartidor_id = u.id AND ie.resultado = 'fallido'
                    AND ie.created_at >= :inicio2 AND ie.created_at < :fin2) AS fallidas,
                (SELECT COUNT(*) FROM pedidos p
                  WHERE p.repartidor_id = u.id AND p.estado = 'en_camino') AS en_camino
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.rol_id
         WHERE LOWER(r.nombre) = 'repartidor'
         ORDER BY exitosas DESC, u.nombre"
    );
    $stmt->execute($rango + [':inicio2' => $inicio, ':fin2' => $fin]);
    $entregas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* --- Usuarios por rol y cuántos se registraron ese mes --- */
    $stmt = $pdo->prepare(
        "SELECT r.nombre AS rol, COUNT(u.id) AS total,
                SUM(u.created_at >= :inicio AND u.created_at < :fin) AS nuevos,
                SUM(u.activo = 0) AS inactivos
         FROM roles r
         LEFT JOIN usuarios u ON u.rol_id = r.id
         GROUP BY r.id, r.nombre
         ORDER BY r.id"
    );
    $stmt->execute($rango);
    $usuariosPorRol = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* --- Inventario por categoría (estado actual) --- */
    $inventario = $pdo->query(
        "SELECT COALESCE(c.nombre, 'Sin categoría') AS categoria,
                COUNT(p.id) AS productos,
                SUM(p.activo = 1) AS activos,
                COALESCE(SUM(p.stock), 0) AS unidades,
                COALESCE(SUM(p.precio * p.stock), 0) AS valor
         FROM productos p
         LEFT JOIN categorias c ON c.id = p.categoria_id
         GROUP BY categoria
         ORDER BY categoria"
    )->fetchAll(PDO::FETCH_ASSOC);

    /* --- Stock bajo: es el inventario de hoy, no el de ese mes --- */
    $stockBajo = $pdo->query(
        "SELECT nombre, stock FROM productos WHERE activo = 1 AND stock <= 5 ORDER BY stock ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "mes" => $mes,
        "ventas" => $ventas,
        "pedidosPorEstado" => $pedidosPorEstado,
        "productosTop" => $productosTop,
        "ventasPorVendedor" => $ventasPorVendedor,
        "entregas" => $entregas,
        "usuariosPorRol" => $usuariosPorRol,
        "inventario" => $inventario,
        "stockBajo" => $stockBajo
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error en Reporte.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "No fue posible generar el reporte."]);
}
