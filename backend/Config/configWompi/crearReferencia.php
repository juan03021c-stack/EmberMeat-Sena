<?php

/* 
Este codigo sirve para iniciar un nuveo pago en wompi,Es el que prepara los datos,
genera la firma de seguridad para que nadie altere el precio y le da al frontend 
lo necesario para abrir la pasarela de Wompi. */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Database.php";

/* aqui se capturan todos los datos del front end*/
$data = json_decode(file_get_contents("php://input"), true);

/* se extraen los datos de la transaccion */
$monto = isset($data['monto']) ? (int)$data['monto'] : null;
$email = $data['email_cliente'] ?? ($data['email'] ?? null);

/* valida que se reciba el monto y el correo */
if (!$monto || !$email) {
    echo json_encode(['success' => false, 'message' => 'Monto y correo electrónico son requeridos.']);
    exit;
}

/* Generar una referencia única*/
$referencia = "REF_" . time() . "_" . rand(1000, 9999);
$moneda = defined('WOMPI_CURRENCY') ? WOMPI_CURRENCY : 'COP';
$secretoIntegridad = defined('WOMPI_INTEGRITY_SECRET') ? WOMPI_INTEGRITY_SECRET : '';

/* generacion de la firma de integridad */
$cadenaFirma = "{$referencia}{$monto}{$moneda}{$secretoIntegridad}";
$firmaIntegridad = hash('sha256', $cadenaFirma);

try {
    $stmt = $pdo->prepare("INSERT INTO transacciones (referencia, monto, email_cliente, estado) VALUES (?, ?, ?, 'PENDING')");
    $stmt->execute([$referencia, $monto, $email]);
} catch (Exception $e) {
    // Si la tabla transacciones no existe, continuar
}

/* respuesta final al frontend, se le envia la referencia, el monto, la moneda, la public key y la firma */
echo json_encode([
    'success' => true,
    'referencia' => $referencia,
    'monto_centavos' => $monto,
    'moneda' => $moneda,
    'public_key' => defined('WOMPI_PUBLIC_KEY') ? WOMPI_PUBLIC_KEY : '',
    'signature' => [
        'integrity' => $firmaIntegridad
    ]
]);