<?php

require_once __DIR__ . '/EnviarCorreo.php';

/* Avisa por correo a los repartidores activos que hay un pedido a domicilio disponible.
   Se manda un solo correo con los repartidores en copia oculta. Si falla, el pedido no se afecta. */
function avisarRepartidores(PDO $pdo, int $pedidoId)
{
    if (!file_exists(__DIR__ . '/Correo.php')) {
        return false;
    }
    require_once __DIR__ . '/Correo.php';

    try {
        $stmtPedido = $pdo->prepare(
            "SELECT p.numero_pedido, p.modalidad_entrega, p.total,
                    COALESCE(NULLIF(TRIM(p.direccion_entrega), ''), dc.direccion) AS direccion,
                    dc.barrio
             FROM pedidos p
             LEFT JOIN direcciones_cliente dc ON p.direccion_id = dc.id
             WHERE p.id = :id"
        );
        $stmtPedido->execute([':id' => $pedidoId]);
        $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

        if (!$pedido || $pedido['modalidad_entrega'] !== 'domicilio') {
            return false;
        }

        $stmtRepartidores = $pdo->query(
            "SELECT u.correo
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE LOWER(r.nombre) = 'repartidor' AND u.activo = 1 AND u.correo <> ''"
        );
        $correos = $stmtRepartidores->fetchAll(PDO::FETCH_COLUMN);

        if (!$correos) {
            return false;
        }

        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $enlace = $protocolo . '://' . ($_SERVER['HTTP_HOST'] ?? 'embermeat.site') . '/MisPedidos';
        $direccion = htmlspecialchars(trim($pedido['direccion'] . ($pedido['barrio'] ? ', ' . $pedido['barrio'] : '')));
        $numero = htmlspecialchars($pedido['numero_pedido']);

        return enviarCorreo(
            MAIL_USER,
            'Repartidores EmberMeat',
            "Nuevo pedido disponible: $numero",
            '<h2>Hay un pedido disponible para entregar</h2>'
                . "<p>Pedido: <strong>$numero</strong></p>"
                . "<p>Dirección: $direccion</p>"
                . '<p>Total: $' . number_format((float)$pedido['total'], 0, ',', '.') . '</p>'
                . "<p><a href=\"$enlace\">Abrir Mis Pedidos para tomarlo</a></p>"
                . '<p style="color:#777">El primer repartidor que lo marque "en camino" se queda con el pedido.</p>',
            $correos
        );
    } catch (Throwable $e) {
        error_log('No se pudo avisar a los repartidores del pedido ' . $pedidoId . ': ' . $e->getMessage());
        return false;
    }
}
