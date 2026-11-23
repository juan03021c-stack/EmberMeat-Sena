<?php

require_once __DIR__ . '/EnviarCorreo.php';

/* Avisa al cliente por correo que su pedido cambió de estado.
   Si falla, el estado igual queda guardado. */
function notificarEstadoPedido(PDO $pdo, int $pedidoId, string $estado, string $motivo = '')
{
    $mensajes = [
        'pendiente'          => ['Recibimos tu pedido', 'Tu pedido está pendiente de confirmación.'],
        'en_preparacion'     => ['Estamos preparando tu pedido', 'Tu pedido fue confirmado y ya lo estamos preparando.'],
        'listo_para_entrega' => ['Tu pedido está listo', 'Tu pedido ya está listo para entregar.'],
        'en_camino'          => ['Tu pedido va en camino', 'El repartidor ya salió con tu pedido. ¡Pronto llega!'],
        'entregado'          => ['Tu pedido fue entregado', '¡Gracias por comprar en EmberMeat! Esperamos que lo disfrutes.'],
        'intento_fallido'    => ['No pudimos entregar tu pedido', 'Intentamos entregar tu pedido pero no fue posible. Te contactaremos para volver a intentarlo.'],
        'cancelado'          => ['Tu pedido fue cancelado', 'Tu pedido fue cancelado. Si tienes dudas, contáctanos desde embermeat.site.'],
    ];
    if (!isset($mensajes[$estado])) {
        return false;
    }

    try {
        $stmt = $pdo->prepare(
            'SELECT p.numero_pedido, p.modalidad_entrega, u.nombre, u.correo
             FROM pedidos p
             INNER JOIN usuarios u ON u.id = p.cliente_id
             WHERE p.id = :id'
        );
        $stmt->execute([':id' => $pedidoId]);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$pedido || !$pedido['correo']) {
            return false;
        }

        [$titulo, $texto] = $mensajes[$estado];
        if ($estado === 'listo_para_entrega' && $pedido['modalidad_entrega'] === 'recogida_punto') {
            $texto = 'Tu pedido ya está listo. Puedes pasar a recogerlo en el punto de venta.';
        }
        if ($estado === 'intento_fallido' && $motivo !== '') {
            $texto .= '<br><br>Motivo: ' . htmlspecialchars($motivo);
        }
        $numero = htmlspecialchars($pedido['numero_pedido']);

        return enviarCorreo(
            $pedido['correo'],
            $pedido['nombre'],
            "$titulo - pedido $numero",
            '<h2 style="margin:0 0 12px">Hola, ' . htmlspecialchars($pedido['nombre']) . '</h2>'
                . "<p>$texto</p>"
                . '<p style="background:#f3f4f6;border-radius:8px;padding:12px 16px">Pedido <strong>' . $numero
                . '</strong><br>Estado: <strong style="color:#c2410c">' . $titulo . '</strong></p>'
        );
    } catch (Throwable $e) {
        error_log('No se pudo notificar el estado del pedido ' . $pedidoId . ': ' . $e->getMessage());
        return false;
    }
}
