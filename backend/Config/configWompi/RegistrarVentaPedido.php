<?php

function registrarVentaPedido(PDO $pdo, int $pedidoId, string $metodoPago): int
{
    $stmtPedido = $pdo->prepare(
        'SELECT p.total, p.vendedor_id, u.nombre AS cliente
         FROM pedidos p
         INNER JOIN usuarios u ON u.id = p.cliente_id
         WHERE p.id = :pedido_id
         FOR UPDATE'
    );
    $stmtPedido->execute([':pedido_id' => $pedidoId]);
    $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        throw new RuntimeException('No se encontró el pedido para registrar la venta.');
    }

    $stmtVentaExistente = $pdo->prepare(
        'SELECT id FROM ventas WHERE pedido_id = :pedido_id LIMIT 1'
    );
    $stmtVentaExistente->execute([':pedido_id' => $pedidoId]);
    $ventaExistente = $stmtVentaExistente->fetchColumn();

    if ($ventaExistente) {
        return (int)$ventaExistente;
    }

    $stmtItems = $pdo->prepare(
        'SELECT producto_id, nombre_producto, cantidad, precio_unit, subtotal
         FROM pedido_items
         WHERE pedido_id = :pedido_id
         ORDER BY id'
    );
    $stmtItems->execute([':pedido_id' => $pedidoId]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) {
        throw new RuntimeException('El pedido aprobado no tiene productos para registrar en la venta.');
    }

    $subtotal = array_sum(array_map(
        static fn(array $item): float => (float)$item['subtotal'],
        $items
    ));
    $metodoPagoVenta = $metodoPago === 'punto'
        ? 'Pago en el punto'
        : 'Wompi - ' . strtoupper(str_replace('_', ' ', $metodoPago));

    $stmtVenta = $pdo->prepare(
        'INSERT INTO ventas (
            pedido_id, cliente, vendedor_id, canal, metodo_pago,
            descuento, subtotal, total
         ) VALUES (
            :pedido_id, :cliente, :vendedor_id, :canal, :metodo_pago,
            0, :subtotal, :total
         )'
    );
    $stmtVenta->execute([
        ':pedido_id' => $pedidoId,
        ':cliente' => $pedido['cliente'],
        ':vendedor_id' => $pedido['vendedor_id'],
        ':canal' => $pedido['vendedor_id'] ? 'Punto de venta' : 'Tienda en línea',
        ':metodo_pago' => $metodoPagoVenta,
        ':subtotal' => $subtotal,
        ':total' => (float)$pedido['total']
    ]);

    $ventaId = (int)$pdo->lastInsertId();
    $stmtDetalle = $pdo->prepare(
        'INSERT INTO venta_detalle (
            venta_id, producto_id, nombre, precio, cantidad, subtotal
         ) VALUES (
            :venta_id, :producto_id, :nombre, :precio, :cantidad, :subtotal
         )'
    );

    foreach ($items as $item) {
        $stmtDetalle->execute([
            ':venta_id' => $ventaId,
            ':producto_id' => $item['producto_id'],
            ':nombre' => $item['nombre_producto'],
            ':precio' => (float)$item['precio_unit'],
            ':cantidad' => (int)$item['cantidad'],
            ':subtotal' => (float)$item['subtotal']
        ]);
    }

    return $ventaId;
}
