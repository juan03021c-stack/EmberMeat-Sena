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

$pedidoId = filter_var($datos['pedido_id'] ?? null, FILTER_VALIDATE_INT);
$repartidorId = filter_var($datos['repartidor_id'] ?? null, FILTER_VALIDATE_INT);
$estadoNuevo = $datos['estado'] ?? '';
$motivo = $datos['motivo'] ?? '';
$estadosPermitidos = ['en_camino', 'entregado', 'intento_fallido'];

if (
    !$pedidoId ||
    !$repartidorId ||
    !is_string($estadoNuevo) ||
    !in_array($estadoNuevo, $estadosPermitidos, true) ||
    !is_string($motivo)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El pedido o el estado no son válidos.']);
    exit;
}
$motivo = trim($motivo);

if ($estadoNuevo === 'intento_fallido' && $motivo === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Debes indicar el motivo del intento fallido.']);
    exit;
}

try {
    $stmtRepartidor = $pdo->prepare(
        "SELECT u.id
         FROM usuarios u
         INNER JOIN roles r ON r.id = u.rol_id
         WHERE u.id = :id
           AND LOWER(r.nombre) = 'repartidor'
           AND u.activo = 1
         LIMIT 1"
    );
    $stmtRepartidor->execute([':id' => $repartidorId]);
    if (!$stmtRepartidor->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'El usuario no es un repartidor activo.']);
        exit;
    }

    $pdo->beginTransaction();
    $stmtPedido = $pdo->prepare(
        'SELECT estado, observacion_entrega, repartidor_id
         FROM pedidos
         WHERE id = :id
         FOR UPDATE'
    );
    $stmtPedido->execute([':id' => $pedidoId]);
    $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'El pedido no existe.']);
        exit;
    }

    $estadoActual = $pedido['estado'];
    $repartidorAsignado = $pedido['repartidor_id'] !== null
        ? (int)$pedido['repartidor_id']
        : null;

    if (
        ($repartidorAsignado !== null && $repartidorAsignado !== $repartidorId) ||
        ($repartidorAsignado === null && $estadoNuevo !== 'en_camino' && $estadoActual !== 'en_camino')
    ) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'El pedido está asignado a otro repartidor o aún no ha sido asignado.'
        ]);
        exit;
    }

    $transiciones = [
        'en_camino' => ['pendiente', 'en_preparacion', 'listo_para_entrega', 'intento_fallido'],
        'entregado' => ['en_camino'],
        'intento_fallido' => ['en_camino']
    ];

    if (!in_array($estadoActual, $transiciones[$estadoNuevo], true)) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'El estado actual del pedido no permite esta actualización.'
        ]);
        exit;
    }

    $observacion = $pedido['observacion_entrega'];
    if ($estadoNuevo === 'intento_fallido') {
        $detalle = 'Intento de entrega fallido: ' . $motivo;
        $observacion = trim(($observacion ? $observacion . "\n" : '') . $detalle);
    }

    $stmtActualizar = $pdo->prepare(
        'UPDATE pedidos
         SET estado = :estado,
             observacion_entrega = :observacion,
             repartidor_id = :repartidor_id
         WHERE id = :id'
    );
    $stmtActualizar->execute([
        ':estado' => $estadoNuevo,
        ':observacion' => $observacion,
        ':repartidor_id' => $repartidorId,
        ':id' => $pedidoId
    ]);

    if (in_array($estadoNuevo, ['entregado', 'intento_fallido'], true)) {
        $motivos = [
            'Cliente no estaba' => 'no_encontrado',
            'Dirección incorrecta' => 'direccion_erronea',
            'Acceso denegado' => 'rechazado',
            'Otro' => 'otro'
        ];
        $resultadoIntento = $estadoNuevo === 'entregado' ? 'exitoso' : 'fallido';
        $motivoFallo = $estadoNuevo === 'intento_fallido'
            ? ($motivos[$motivo] ?? 'otro')
            : null;
        $observacionIntento = $estadoNuevo === 'intento_fallido' ? $motivo : null;

        $stmtIntento = $pdo->prepare(
            'INSERT INTO intentos_entrega (
                pedido_id, repartidor_id, resultado, motivo_fallo, observacion
             ) VALUES (
                :pedido_id, :repartidor_id, :resultado, :motivo_fallo, :observacion
             )'
        );
        $stmtIntento->execute([
            ':pedido_id' => $pedidoId,
            ':repartidor_id' => $repartidorId,
            ':resultado' => $resultadoIntento,
            ':motivo_fallo' => $motivoFallo,
            ':observacion' => $observacionIntento
        ]);
    }

    $pdo->commit();

    /* --- Avisar al cliente del nuevo estado; si falla, el estado igual queda guardado --- */
    $stmtCliente = $pdo->prepare(
        'SELECT p.numero_pedido, u.nombre, u.correo
         FROM pedidos p
         INNER JOIN usuarios u ON u.id = p.cliente_id
         WHERE p.id = :id'
    );
    $stmtCliente->execute([':id' => $pedidoId]);
    $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);

    if ($cliente && $cliente['correo']) {
        require_once __DIR__ . '/../Config/EnviarCorreo.php';
        $mensajes = [
            'en_camino' => 'Tu pedido va en camino. ¡Pronto llega!',
            'entregado' => 'Tu pedido fue entregado. ¡Gracias por comprar en EmberMeat!',
            'intento_fallido' => 'No pudimos entregar tu pedido. Motivo: ' . htmlspecialchars($motivo)
                . '. Te contactaremos para volver a intentarlo.'
        ];
        enviarCorreo(
            $cliente['correo'],
            $cliente['nombre'],
            'Tu pedido ' . $cliente['numero_pedido'] . ' cambió de estado',
            '<h2>Hola, ' . htmlspecialchars($cliente['nombre']) . '</h2>'
                . '<p>Pedido: <strong>' . $cliente['numero_pedido'] . '</strong></p>'
                . '<p>' . $mensajes[$estadoNuevo] . '</p>'
        );
    }

    echo json_encode([
        'success' => true,
        'message' => 'Estado del pedido actualizado correctamente.',
        'estado' => $estadoNuevo,
        'repartidor_id' => $repartidorId,
        'pedido_id' => $pedidoId
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el estado del pedido: ' . $e->getMessage()
    ]);
}