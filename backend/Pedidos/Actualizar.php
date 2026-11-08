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

$pedidoId = filter_var($datos['id'] ?? null, FILTER_VALIDATE_INT);
$clienteId = filter_var($datos['cliente_id'] ?? null, FILTER_VALIDATE_INT);
$nombreCliente = isset($datos['nombre_cliente']) && is_string($datos['nombre_cliente'])
    ? trim($datos['nombre_cliente'])
    : '';
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
    !$pedidoId ||
    !$clienteId ||
    $nombreCliente === '' ||
    strlen($nombreCliente) > 255 ||
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
    $pdo->beginTransaction();

    $stmtCliente = $pdo->prepare(
        "SELECT u.id
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.rol_id
         WHERE u.id = :id AND LOWER(r.nombre) = 'cliente'
         LIMIT 1"
    );
    $stmtCliente->execute([':id' => $clienteId]);
    if (!$stmtCliente->fetchColumn()) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El cliente seleccionado no es válido.']);
        exit;
    }

    $stmtActualizarNombre = $pdo->prepare(
        'UPDATE usuarios SET nombre = :nombre WHERE id = :id'
    );
    $stmtActualizarNombre->execute([
        ':nombre' => $nombreCliente,
        ':id' => $clienteId
    ]);

    $stmtPedido = $pdo->prepare(
        "UPDATE pedidos
         SET cliente_id = :cliente_id,
             modalidad_entrega = :modalidad,
             direccion_entrega = :direccion,
             estado = :estado,
             total = :total,
             created_at = :created_at
         WHERE id = :id"
    );
    $stmtPedido->execute([
        ':cliente_id' => $clienteId,
        ':modalidad' => $modalidad,
        ':direccion' => $direccion !== '' ? $direccion : null,
        ':estado' => $estado,
        ':total' => (float)$total,
        ':created_at' => $fecha . ' 00:00:00',
        ':id' => $pedidoId
    ]);

    if ($stmtPedido->rowCount() === 0) {
        $stmtExiste = $pdo->prepare('SELECT id FROM pedidos WHERE id = :id');
        $stmtExiste->execute([':id' => $pedidoId]);
        if (!$stmtExiste->fetchColumn()) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'El pedido no existe.']);
            exit;
        }
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido actualizado correctamente.']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el pedido: ' . $e->getMessage()
    ]);
}
