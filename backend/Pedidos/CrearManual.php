<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

require_once __DIR__ . '/../Config/Database.php';

$datos = json_decode(file_get_contents('php://input'), true);
if (!is_array($datos)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El cuerpo de la solicitud no es válido.']);
    exit;
}

$clienteId = filter_var($datos['cliente_id'] ?? null, FILTER_VALIDATE_INT);
$total = $datos['total'] ?? null;
$fecha = $datos['fecha'] ?? '';
$modalidad = $datos['modalidad_entrega'] ?? '';
$estado = $datos['estado'] ?? '';
$direccion = $datos['direccion_entrega'] ?? '';
$estadosPermitidos = [
    'pendiente',
    'en_preparacion',
    'listo_para_entrega',
    'en_camino',
    'entregado',
    'intento_fallido',
    'cancelado'
];

$fechaValida = is_string($fecha) ? DateTime::createFromFormat('!Y-m-d', $fecha) : false;
if (
    !$clienteId ||
    !is_numeric($total) ||
    (float)$total < 0 ||
    !$fechaValida ||
    $fechaValida->format('Y-m-d') !== $fecha ||
    !is_string($modalidad) ||
    !in_array($modalidad, ['domicilio', 'recogida_punto'], true) ||
    !is_string($estado) ||
    !in_array($estado, $estadosPermitidos, true) ||
    !is_string($direccion)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Los datos del pedido no son válidos.']);
    exit;
}
$direccion = trim($direccion);

try {
    $stmtCliente = $pdo->prepare(
        "SELECT u.id
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.rol_id
         WHERE u.id = :id AND LOWER(r.nombre) = 'cliente' AND u.activo = 1
         LIMIT 1"
    );
    $stmtCliente->execute([':id' => $clienteId]);

    if (!$stmtCliente->fetchColumn()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El cliente seleccionado no está disponible.']);
        exit;
    }

    $numeroPedido = 'PED-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
    $stmtPedido = $pdo->prepare(
        "INSERT INTO pedidos (
            numero_pedido, cliente_id, modalidad_entrega, direccion_entrega,
            estado, total, created_at
        ) VALUES (
            :numero_pedido, :cliente_id, :modalidad, :direccion,
            :estado, :total, :created_at
        )"
    );
    $stmtPedido->execute([
        ':numero_pedido' => $numeroPedido,
        ':cliente_id' => $clienteId,
        ':modalidad' => $modalidad,
        ':direccion' => $direccion !== '' ? $direccion : null,
        ':estado' => $estado,
        ':total' => (float)$total,
        ':created_at' => $fecha . ' 00:00:00'
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Pedido creado correctamente.',
        'pedido_id' => (int)$pdo->lastInsertId(),
        'numero_pedido' => $numeroPedido
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear el pedido: ' . $e->getMessage()
    ]);
}
