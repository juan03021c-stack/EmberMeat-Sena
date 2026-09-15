<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Config/Database.php";

$numeroPedido = $_GET['numero_pedido'] ?? null;
$pedidoId = $_GET['pedido_id'] ?? null;

if (empty($numeroPedido) && empty($pedidoId)) {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere numero_pedido o pedido_id.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            p.id AS pedido_id,
            p.numero_pedido,
            p.estado AS estado_pedido,
            p.total,
            t.id AS transaccion_id,
            t.wompi_transaction_id,
            t.estado AS estado_transaccion,
            t.metodo_pago,
            t.monto,
            t.updated_at
        FROM pedidos p
        LEFT JOIN transacciones t ON (t.pedido_id = p.id OR t.referencia = p.numero_pedido)
        WHERE p.numero_pedido = :numero_pedido OR p.id = :pedido_id
        ORDER BY t.id DESC
        LIMIT 1
    ");

    $stmt->execute([
        ':numero_pedido' => $numeroPedido,
        ':pedido_id'     => $pedidoId
    ]);

    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        echo json_encode([
            'success' => false,
            'message' => 'Pedido no encontrado.'
        ]);
        exit;
    }

    $estadoPedido = $pedido['estado_pedido']; // pendiente, en_preparacion, cancelado, etc.
    $estadoTransaccion = $pedido['estado_transaccion']; // aprobada, rechazada, etc.

    // Determinar si ya finalizó el pago
    $finalizado = false;
    $aprobado = false;

    if ($estadoPedido === 'en_preparacion' || $estadoPedido === 'listo_para_entrega' || $estadoPedido === 'en_camino' || $estadoPedido === 'entregado' || $estadoTransaccion === 'aprobada') {
        $finalizado = true;
        $aprobado = true;
    } elseif ($estadoPedido === 'cancelado' || $estadoTransaccion === 'rechazada' || $estadoTransaccion === 'error') {
        $finalizado = true;
        $aprobado = false;
    }

    echo json_encode([
        'success'              => true,
        'finalizado'           => $finalizado,
        'aprobado'             => $aprobado,
        'estado_pedido'        => $estadoPedido,
        'estado_transaccion'   => $estadoTransaccion,
        'numero_pedido'        => $pedido['numero_pedido'],
        'pedido_id'            => $pedido['pedido_id'],
        'wompi_transaction_id' => $pedido['wompi_transaction_id'] ?? null,
        'total'                => $pedido['total']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
