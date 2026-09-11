<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Config/Database.php";

/* --- Leer datos (compatible con JSON y con FormData)---*/
$lectura_informacion = file_get_contents('php://input');
$jsonData = json_decode($lectura_informacion, true);

$cliente = [];
$productos = [];

if (is_array($jsonData)) {
    /* --- Si viene estructurado como { datoCliente: {...}, productosPedido: [...] } ---*/
    $cliente = $jsonData['datoCliente'] ?? $jsonData['cliente'] ?? $jsonData;
    $productos = $jsonData['productosPedido'] ?? $jsonData['productos'] ?? [];
} else {
    /* --- Si viene por $_POST (FormData) ---*/
    $cliente = [
        'nombre'       => $_POST['nombre'] ?? '',
        'email'        => $_POST['email'] ?? $_POST['correo'] ?? '',
        'telefono'     => $_POST['telefono'] ?? '',
        'direccion'    => $_POST['direccion'] ?? '',
        'cedula'       => $_POST['cedula'] ?? '',
        'metodo_envio' => $_POST['metodo_envio'] ?? $_POST['metodoEnvio'] ?? 'domicilio'
    ];
    if (isset($_POST['productos'])) {
        $productos = is_string($_POST['productos']) ? json_decode($_POST['productos'], true) : $_POST['productos'];
    }
}

/* --- Extraer campos del cliente ---*/
$nombre = trim($cliente['nombre'] ?? '');
$correo = trim($cliente['email'] ?? $cliente['correo'] ?? '');
$telefono = trim($cliente['telefono'] ?? '');
$direccion = trim($cliente['direccion'] ?? '');
$cedula = trim($cliente['cedula'] ?? '');
$metodoEnvioRaw = trim($cliente['metodoEnvio'] ?? $cliente['metodo_envio'] ?? 'domicilio');

/* --- Mapear modalidad de entrega en la base de datos ('domicilio', 'recogida_punto') ---*/
$modalidadEntrega = ($metodoEnvioRaw === 'tienda' || $metodoEnvioRaw === 'recogida_punto')
    ? 'recogida_punto'
    : 'domicilio';

/* --- Validaciones básicas ---*/
if (empty($nombre) || empty($correo)) {
    echo json_encode([
        "success" => false,
        "message" => "El nombre y el correo electrónico son obligatorios."
    ]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "El correo electrónico no es válido."
    ]);
    exit;
}

if (empty($productos) || !is_array($productos)) {
    echo json_encode([
        "success" => false,
        "message" => "El pedido debe contener al menos un producto."
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    /* --- Buscar o crear el usuario cliente en la tabla `usuarios` ---*/
    $stmtUsuario = $pdo->prepare(
        "SELECT id, nombre, telefono, cedula, correo 
         FROM usuarios 
         WHERE (cedula = :cedula AND :cedula != '') OR correo = :correo 
         LIMIT 1"
    );
    $stmtUsuario->execute([
        ':cedula' => $cedula,
        ':correo' => $correo
    ]);
    $usuarioExistente = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

    $clienteId = null;

    if ($usuarioExistente) {
        $clienteId = (int)$usuarioExistente['id'];
        /* --- Actualizar cédula, teléfono o nombre si están disponibles y no estaban previamente ---*/
        $updateCampos = [];
        $paramsUpdate = [':id' => $clienteId];

        if (!empty($nombre) && $usuarioExistente['nombre'] !== $nombre) {
            $updateCampos[] = "nombre = :nombre";
            $paramsUpdate[':nombre'] = $nombre;
        }
        if (!empty($telefono) && empty($usuarioExistente['telefono'])) {
            $updateCampos[] = "telefono = :telefono";
            $paramsUpdate[':telefono'] = $telefono;
        }
        if (!empty($cedula) && empty($usuarioExistente['cedula'])) {
            $updateCampos[] = "cedula = :cedula";
            $paramsUpdate[':cedula'] = $cedula;
        }
        if (!empty($updateCampos)) {
            $sqlUp = "UPDATE usuarios SET " . implode(", ", $updateCampos) . " WHERE id = :id";
            $stmtUp = $pdo->prepare($sqlUp);
            $stmtUp->execute($paramsUpdate);
        }
    } else {
        /* --- Rol 1 = cliente (según tabla roles) ---*/
        $rolClienteId = 1;
        $hashPassword = password_hash('Cliente123!', PASSWORD_DEFAULT);

        $stmtNuevoUsuario = $pdo->prepare(
            "INSERT INTO usuarios (rol_id, nombre, correo, cedula, contrasena_hash, telefono, activo)
             VALUES (:rol_id, :nombre, :correo, :cedula, :contrasena_hash, :telefono, 1)"
        );
        $stmtNuevoUsuario->execute([
            ':rol_id'          => $rolClienteId,
            ':nombre'          => $nombre,
            ':correo'          => $correo,
            ':cedula'          => !empty($cedula) ? $cedula : null,
            ':contrasena_hash' => $hashPassword,
            ':telefono'        => !empty($telefono) ? $telefono : null
        ]);
        $clienteId = (int)$pdo->lastInsertId();
    }

    /* --- Gestionar dirección en `direcciones_cliente` si la entrega es a domicilio ---*/
    $direccionId = null;
    if ($modalidadEntrega === 'domicilio' && !empty($direccion)) {
        /* --- Verificar si ya tiene registrada esta dirección ---*/
        $stmtDirCheck = $pdo->prepare(
            "SELECT id FROM direcciones_cliente WHERE usuario_id = :usuario_id AND direccion = :direccion LIMIT 1"
        );
        $stmtDirCheck->execute([
            ':usuario_id' => $clienteId,
            ':direccion'  => $direccion
        ]);
        $dirExistente = $stmtDirCheck->fetch(PDO::FETCH_ASSOC);

        if ($dirExistente) {
            $direccionId = (int)$dirExistente['id'];
        } else {
            $stmtDirInsert = $pdo->prepare(
                "INSERT INTO direcciones_cliente (usuario_id, direccion, ciudad, es_principal, activa)
                 VALUES (:usuario_id, :direccion, 'Bogotá', 1, 1)"
            );
            $stmtDirInsert->execute([
                ':usuario_id' => $clienteId,
                ':direccion'  => $direccion
            ]);
            $direccionId = (int)$pdo->lastInsertId();
        }
    }

    /* --- Generar número de pedido único (ej: PED-20260905-XXXX) ---*/
    $numeroPedido = 'PED-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

    /* --- Calcular el total acumulado y validar los productos ---*/
    $totalCalculado = 0;
    $itemsValidados = [];

    foreach ($productos as $item) {
        $prodId = isset($item['id']) ? (int)$item['id'] : (isset($item['producto_id']) ? (int)$item['producto_id'] : null);
        $cantidad = isset($item['cantidad']) ? (int)$item['cantidad'] : 1;
        $precioUnit = isset($item['precio_unitario']) ? (float)$item['precio_unitario'] : (isset($item['precio']) ? (float)$item['precio'] : 0);
        $nombreProducto = trim($item['nombre'] ?? $item['nombre_producto'] ?? 'Producto');

        if ($cantidad <= 0) continue;

        /* --- Si existe el producto en base de datos, validar nombre y precio; si no existe, usar null para evitar error de FK ---*/
        if ($prodId) {
            $stmtProd = $pdo->prepare("SELECT id, nombre, precio, stock FROM productos WHERE id = :id LIMIT 1");
            $stmtProd->execute([':id' => $prodId]);
            $prodDb = $stmtProd->fetch(PDO::FETCH_ASSOC);
            if ($prodDb) {
                $nombreProducto = $prodDb['nombre'];
                $precioUnit = (float)$prodDb['precio'];
            } else {
                $prodId = null;
            }
        }

        $subtotal = $precioUnit * $cantidad;
        $totalCalculado += $subtotal;

        $itemsValidados[] = [
            'producto_id'     => $prodId,
            'nombre_producto' => $nombreProducto,
            'cantidad'        => $cantidad,
            'precio_unit'     => $precioUnit,
            'subtotal'        => $subtotal
        ];
    }

    if (empty($itemsValidados)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "No se encontraron productos válidos para procesar el pedido."
        ]);
        exit;
    }

    if ($totalCalculado < 1500) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "El monto total mínimo para compras con pasarela de pago Wompi es de $1.500 COP."
        ]);
        exit;
    }

    /* --- Insertar en tabla `pedidos` ---*/
    $observacionEntrega = !empty($cedula) ? "Cédula: {$cedula}" : null;
    $direccionTexto = $modalidadEntrega === 'domicilio' ? $direccion : 'Recogida en tienda';

    $stmtPedido = $pdo->prepare(
        "INSERT INTO pedidos (
            numero_pedido, 
            cliente_id, 
            direccion_id, 
            modalidad_entrega, 
            direccion_entrega, 
            estado, 
            observacion_entrega, 
            total
        ) VALUES (
            :numero_pedido, 
            :cliente_id, 
            :direccion_id, 
            :modalidad_entrega, 
            :direccion_entrega, 
            'pendiente', 
            :observacion_entrega, 
            :total
        )"
    );

    $stmtPedido->execute([
        ':numero_pedido'       => $numeroPedido,
        ':cliente_id'          => $clienteId,
        ':direccion_id'        => $direccionId,
        ':modalidad_entrega'   => $modalidadEntrega,
        ':direccion_entrega'   => $direccionTexto,
        ':observacion_entrega' => $observacionEntrega,
        ':total'               => $totalCalculado
    ]);

    $pedidoId = (int)$pdo->lastInsertId();

    /* --- Insertar los ítems en `pedido_items` y actualizar stock ---*/
    $stmtItem = $pdo->prepare(
        "INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, cantidad, precio_unit, subtotal)
         VALUES (:pedido_id, :producto_id, :nombre_producto, :cantidad, :precio_unit, :subtotal)"
    );

    $stmtUpdateStock = $pdo->prepare(
        "UPDATE productos SET stock = GREATEST(0, stock - :cantidad) WHERE id = :id"
    );

    foreach ($itemsValidados as $item) {
        $stmtItem->execute([
            ':pedido_id'       => $pedidoId,
            ':producto_id'     => $item['producto_id'],
            ':nombre_producto' => $item['nombre_producto'],
            ':cantidad'        => $item['cantidad'],
            ':precio_unit'     => $item['precio_unit'],
            ':subtotal'        => $item['subtotal']
        ]);

        if ($item['producto_id']) {
            $stmtUpdateStock->execute([
                ':cantidad' => $item['cantidad'],
                ':id'       => $item['producto_id']
            ]);
        }
    }

    $pdo->commit();

    /* --- Preparar datos de pago para Wompi con firma de integridad SHA256 --- */
    $montoCentavos = (int)round($totalCalculado * 100);
    $moneda = defined('WOMPI_CURRENCY') ? WOMPI_CURRENCY : 'COP';
    $secretoIntegridad = defined('WOMPI_INTEGRITY_SECRET') ? WOMPI_INTEGRITY_SECRET : '';
    
    /* Fórmula Wompi: SHA256(referencia + montoEnCentavos + moneda + secretoIntegridad) */
    $cadenaFirma = "{$numeroPedido}{$montoCentavos}{$moneda}{$secretoIntegridad}";
    $firmaIntegridad = hash('sha256', $cadenaFirma);

    $wompiData = [
        'publicKey'     => defined('WOMPI_PUBLIC_KEY') ? WOMPI_PUBLIC_KEY : '',
        'currency'      => $moneda,
        'amountInCents' => $montoCentavos,
        'reference'     => $numeroPedido,
        'signature'     => [
            'integrity' => $firmaIntegridad
        ],
        'customerData'  => [
            'email'             => $correo,
            'fullName'          => $nombre,
            'phoneNumber'       => !empty($telefono) ? $telefono : null,
            'phoneNumberPrefix' => '+57'
        ]
    ];

    echo json_encode([
        "success"        => true,
        "message"        => "¡Pedido registrado! Preparando pasarela de pago...",
        "pedido_id"      => $pedidoId,
        "numero_pedido"  => $numeroPedido,
        "total"          => $totalCalculado,
        "wompi"          => $wompiData
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error en la base de datos al registrar el pedido: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor al registrar el pedido: " . $e->getMessage()
    ]);
}
