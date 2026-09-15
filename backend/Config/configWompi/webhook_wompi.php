<?php
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . "/../Database.php";

// 1. Recibir el evento enviado por Wompi
$bodyRaw = file_get_contents('php://input');
$event = json_decode($bodyRaw, true);

if (!$event || !isset($event['event'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Cuerpo de solicitud inválido']);
    exit;
}

if ($event['event'] !== 'transaction.updated') {
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'message' => 'Evento no procesado']);
    exit;
}

$transaction = $event['data']['transaction'] ?? null;
if (!$transaction) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de transacción no encontrados']);
    exit;
}

$wompiId   = $transaction['id'] ?? '';
$referencia = $transaction['reference'] ?? '';
$status     = strtoupper($transaction['status'] ?? ''); // APPROVED, DECLINED, VOIDED, ERROR, PENDING
$metodoRaw  = strtoupper($transaction['payment_method_type'] ?? 'PSE');
$montoCentavos = $transaction['amount_in_cents'] ?? 0;
$montoPesos = round($montoCentavos / 100, 2);

// 2. Validar firma/checksum del evento si está configurado el secreto de eventos
if (defined('WOMPI_EVENTS_SECRET') && !empty(WOMPI_EVENTS_SECRET) && isset($event['signature']['checksum'])) {
    $properties = $event['signature']['properties'] ?? ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    $cadenaPropiedades = '';

    foreach ($properties as $prop) {
        $parts = explode('.', $prop);
        if (count($parts) === 2 && $parts[0] === 'transaction' && isset($transaction[$parts[1]])) {
            $cadenaPropiedades .= $transaction[$parts[1]];
        }
    }

    $timestamp = $event['timestamp'] ?? '';
    $checksumCalculado = hash('sha256', $cadenaPropiedades . $timestamp . WOMPI_EVENTS_SECRET);

    if (!hash_equals($checksumCalculado, $event['signature']['checksum'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Checksum de firma inválido']);
        exit;
    }
}

// 3. Mapear estado para tabla `pedidos` ('pendiente','en_preparacion','listo_para_entrega','en_camino','entregado','intento_fallido','cancelado')
$estadoPedido = 'pendiente';
if ($status === 'APPROVED') {
    $estadoPedido = 'en_preparacion';
} elseif ($status === 'DECLINED' || $status === 'VOIDED' || $status === 'ERROR') {
    $estadoPedido = 'cancelado';
}

// 4. Mapear estado para tabla `transacciones` ('pendiente','aprobada','rechazada','error','reembolsada','parcial')
$estadoTransaccion = 'pendiente';
if ($status === 'APPROVED') {
    $estadoTransaccion = 'aprobada';
} elseif ($status === 'DECLINED') {
    $estadoTransaccion = 'rechazada';
} elseif ($status === 'VOIDED' || $status === 'ERROR') {
    $estadoTransaccion = 'error';
}

// 5. Mapear método de pago para `transacciones` ('tarjeta_credito','tarjeta_debito','pse','efectivo','transferencia')
$metodoPagoDb = 'pse';
if (strpos($metodoRaw, 'CARD') !== false) {
    $metodoPagoDb = 'tarjeta_credito';
} elseif (strpos($metodoRaw, 'NEQUI') !== false || strpos($metodoRaw, 'BANCOLOMBIA') !== false || strpos($metodoRaw, 'TRANSFER') !== false) {
    $metodoPagoDb = 'transferencia';
}

try {
    $pedidoId = null;

    // Buscar y actualizar pedido por número de pedido / referencia
    if (!empty($referencia)) {
        $stmtBuscarPedido = $pdo->prepare("SELECT id FROM pedidos WHERE numero_pedido = :referencia LIMIT 1");
        $stmtBuscarPedido->execute([':referencia' => $referencia]);
        $pedidoRow = $stmtBuscarPedido->fetch(PDO::FETCH_ASSOC);

        if ($pedidoRow) {
            $pedidoId = (int)$pedidoRow['id'];
            $stmtUpdatePedido = $pdo->prepare("UPDATE pedidos SET estado = :estado WHERE id = :id");
            $stmtUpdatePedido->execute([
                ':estado' => $estadoPedido,
                ':id'     => $pedidoId
            ]);
        }
    }

    // Registrar o actualizar en tabla `transacciones` si tenemos el pedido
    if ($pedidoId) {
        $stmtCheckTrans = $pdo->prepare("SELECT id FROM transacciones WHERE referencia = :ref OR wompi_transaction_id = :wid LIMIT 1");
        $stmtCheckTrans->execute([':ref' => $referencia, ':wid' => $wompiId]);
        $transRow = $stmtCheckTrans->fetch(PDO::FETCH_ASSOC);

        if ($transRow) {
            $stmtUpTrans = $pdo->prepare("
                UPDATE transacciones 
                SET wompi_transaction_id = :wid, estado = :estado, metodo_pago = :metodo, monto = :monto, moneda = 'COP'
                WHERE id = :id
            ");
            $stmtUpTrans->execute([
                ':wid'    => $wompiId,
                ':estado' => $estadoTransaccion,
                ':metodo' => $metodoPagoDb,
                ':monto'  => $montoPesos,
                ':id'     => $transRow['id']
            ]);
        } else {
            $stmtInTrans = $pdo->prepare("
                INSERT INTO transacciones (pedido_id, wompi_transaction_id, metodo_pago, monto, estado, referencia, moneda)
                VALUES (:pedido_id, :wid, :metodo, :monto, :estado, :referencia, 'COP')
            ");
            $stmtInTrans->execute([
                ':pedido_id'   => $pedidoId,
                ':wid'         => $wompiId,
                ':metodo'      => $metodoPagoDb,
                ':monto'       => $montoPesos,
                ':estado'      => $estadoTransaccion,
                ':referencia'  => $referencia
            ]);
        }
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Transacción procesada correctamente',
        'referencia' => $referencia,
        'estado_pedido' => $estadoPedido,
        'estado_transaccion' => $estadoTransaccion
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}