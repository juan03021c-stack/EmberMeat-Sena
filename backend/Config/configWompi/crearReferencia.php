<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Database.php";

$data = json_decode(file_get_contents("php://input"), true);

$monto = isset($data['monto']) ? (int)$data['monto'] : null;
$email = $data['email_cliente'] ?? ($data['email'] ?? null);

if (!$monto || !$email) {
    echo json_encode(['success' => false, 'message' => 'Monto y correo electrónico son requeridos.']);
    exit;
}

// Generar una referencia única
$referencia = "REF_" . time() . "_" . rand(1000, 9999);
$moneda = defined('WOMPI_CURRENCY') ? WOMPI_CURRENCY : 'COP';
$secretoIntegridad = defined('WOMPI_INTEGRITY_SECRET') ? WOMPI_INTEGRITY_SECRET : '';

$cadenaFirma = "{$referencia}{$monto}{$moneda}{$secretoIntegridad}";
$firmaIntegridad = hash('sha256', $cadenaFirma);

try {
    $stmt = $pdo->prepare("INSERT INTO transacciones (referencia, monto, email_cliente, estado) VALUES (?, ?, ?, 'PENDING')");
    $stmt->execute([$referencia, $monto, $email]);
} catch (Exception $e) {
    // Si la tabla transacciones no existe, continuar
}

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