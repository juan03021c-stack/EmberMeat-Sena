<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Database.php";

/* Obtener el ID de la transacción o la referencia */
$transactionId = $_GET['id'] ?? null;
$referenceQuery = $_GET['reference'] ?? null;

/* valida que se reciba el ID o la referencia */
if (empty($transactionId) && empty($referenceQuery)) {
    echo json_encode([
        'success' => false,
        'message' => 'El ID o la referencia de la transacción son obligatorios.'
    ]);
    exit;
}

/* Determinar el ambiente de Wompi (Sandbox vs Producción) 
si la public key comienza con 'pub_test_' es sandbox, si no es producción */
$isSandbox = strpos(WOMPI_PUBLIC_KEY, 'pub_test_') === 0;
$baseUrl = $isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

/* Construir la URL para consultar la transacción */
$url = !empty($transactionId)
    ? "{$baseUrl}/transactions/" . rawurlencode($transactionId)
    : "{$baseUrl}/transactions?reference=" . rawurlencode($referenceQuery);

/* Realizar la solicitud a la API de Wompi */
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . (defined('WOMPI_PRIVATE_KEY') ? WOMPI_PRIVATE_KEY : WOMPI_PUBLIC_KEY),
    'Accept: application/json'
]);
/* Establecer un tiempo máximo de espera */
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

/* Ejecutar la solicitud y capturar la respuesta */
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

/* Cerrar la sesión de cURL */
curl_close($ch);

/* Validar si hubo un error en la solicitud */
if ($curlError) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con Wompi: ' . $curlError
    ]);
    exit;
}

/* Decodificar la respuesta de Wompi */
$data = json_decode($response, true);

/* Validar si la respuesta fue exitosa */
if ($httpCode !== 200 || !isset($data['data'])) {
    echo json_encode([
        'success' => false,
        'message' => $data['error']['reason'] ?? ($data['error']['message'] ?? 'No se pudo consultar el estado de la transacción en Wompi.'),
        'wompi_response' => $data
    ]);
    exit;
}

/* Procesar la respuesta de Wompi */
$transaction = $data['data'];
if (empty($transactionId)) {
    $transaction = is_array($transaction) && isset($transaction[0]) ? $transaction[0] : null;
}

/* Validar si la transacción existe */
if (!$transaction || empty($transaction['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Todavía no existe una transacción para esta referencia.',
        'data' => null
    ]);
    exit;
}

/* Extracción de datos de la transacción */
$referencia = $transaction['reference'] ?? '';
$status = strtoupper($transaction['status'] ?? '');
$metodoRaw = strtoupper($transaction['payment_method_type'] ?? 'PSE');
$montoCentavos = $transaction['amount_in_cents'] ?? 0;
$montoPesos = round($montoCentavos / 100, 2);

// Mapeo para `pedidos` ('pendiente','en_preparacion','listo_para_entrega','en_camino','entregado','intento_fallido','cancelado')
$estadoPedido = 'pendiente';
if ($status === 'APPROVED') {
    $estadoPedido = 'en_preparacion';
} elseif ($status === 'DECLINED' || $status === 'VOIDED' || $status === 'ERROR') {
    $estadoPedido = 'cancelado';
}

// Mapeo para `transacciones` ('pendiente','aprobada','rechazada','error','reembolsada','parcial')
$estadoTransaccion = 'pendiente';
if ($status === 'APPROVED') {
    $estadoTransaccion = 'aprobada';
} elseif ($status === 'DECLINED') {
    $estadoTransaccion = 'rechazada';
} elseif ($status === 'VOIDED' || $status === 'ERROR') {
    $estadoTransaccion = 'error';
}

/* Mapeo para `metodo_pago` ('tarjeta_credito','tarjeta_debito','pse','efectivo','transferencia') */
$metodoPagoDb = 'pse';
if (strpos($metodoRaw, 'CARD') !== false) {
    $metodoPagoDb = 'tarjeta_credito';
} elseif (strpos($metodoRaw, 'NEQUI') !== false || strpos($metodoRaw, 'BANCOLOMBIA') !== false || strpos($metodoRaw, 'TRANSFER') !== false) {
    $metodoPagoDb = 'transferencia';
}

/* Actualizar en base de datos si el pedido existe */
$baseDatosSincronizada = false;
$errorBaseDatos = null;
if (!empty($referencia)) {
    try {
        /* Consultar el pedido local */
        $stmtBuscarPedido = $pdo->prepare("SELECT id FROM pedidos WHERE numero_pedido = :referencia LIMIT 1");
        $stmtBuscarPedido->execute([':referencia' => $referencia]);
        $pedidoRow = $stmtBuscarPedido->fetch(PDO::FETCH_ASSOC);

        /* Actualizar estado del pedido */
        if ($pedidoRow) {
            $pedidoId = (int)$pedidoRow['id'];
            $stmtUpdatePedido = $pdo->prepare("UPDATE pedidos SET estado = :estado WHERE id = :id");
            $stmtUpdatePedido->execute([
                ':estado' => $estadoPedido,
                ':id'     => $pedidoId
            ]);

            /* verificar si existe el registro de la transacción */
            $stmtCheckTrans = $pdo->prepare("SELECT id FROM transacciones WHERE referencia = :ref OR wompi_transaction_id = :wid LIMIT 1");
            $stmtCheckTrans->execute([':ref' => $referencia, ':wid' => $transaction['id']]);
            $transRow = $stmtCheckTrans->fetch(PDO::FETCH_ASSOC);

            /* si existe actualiza el registro*/
            if ($transRow) {
                $stmtUpTrans = $pdo->prepare("
                    UPDATE transacciones 
                    SET wompi_transaction_id = :wid, estado = :estado, metodo_pago = :metodo, monto = :monto, moneda = 'COP'
                    WHERE id = :id
                ");

                /* Ejecutar la actualización */
                $stmtUpTrans->execute([
                    ':wid'    => $transaction['id'],
                    ':estado' => $estadoTransaccion,
                    ':metodo' => $metodoPagoDb,
                    ':monto'  => $montoPesos,
                    ':id'     => $transRow['id']
                ]);
                $baseDatosSincronizada = true;
            /* si no existe, creamos el registro nuevo*/
            } else {
                $stmtInTrans = $pdo->prepare("
                    INSERT INTO transacciones (pedido_id, wompi_transaction_id, metodo_pago, monto, estado, referencia, moneda)
                    VALUES (:pedido_id, :wid, :metodo, :monto, :estado, :referencia, 'COP')
                ");
                $stmtInTrans->execute([
                    ':pedido_id'   => $pedidoId,
                    ':wid'         => $transaction['id'],
                    ':metodo'      => $metodoPagoDb,
                    ':monto'       => $montoPesos,
                    ':estado'      => $estadoTransaccion,
                    ':referencia'  => $referencia
                ]);
                $baseDatosSincronizada = true;
            }
        } else {
            $errorBaseDatos = 'No se encontró un pedido con la referencia recibida.';
        }
    } catch (Exception $e) {
        error_log('Error sincronizando transacción Wompi: ' . $e->getMessage());
        $errorBaseDatos = 'La transacción fue consultada, pero no se pudo guardar en la base de datos.';
    }
}

/* respuesta final al cliente,  esto devuele toda la informacion procesada al backend */
echo json_encode([
    'success' => true,
    'data' => [
        'id'                  => $transaction['id'] ?? '',
        'reference'           => $referencia,
        'status'              => $status,
        'amount_in_cents'     => $montoCentavos,
        'currency'            => $transaction['currency'] ?? 'COP',
        'payment_method_type' => $metodoRaw,
        'customer_email'      => $transaction['customer_email'] ?? '',
        'created_at'          => $transaction['created_at'] ?? '',
        'status_message'      => $transaction['status_message'] ?? null,
        'database_synced'     => $baseDatosSincronizada,
        'database_error'      => $errorBaseDatos
    ]
]);
