<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../Config/Database.php";
$datos = json_decode(file_get_contents('php://input'), true);
$email = $datos['email'] ?? '';
$password = $datos['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos de inicio de sesión."
    ]);
    exit;
}

$sql = "SELECT id, rol_id, nombre, correo, contrasena_hash FROM usuarios WHERE correo = ?";

$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuario) {
    echo json_encode([
        "success" => false,
        "message" => "Correo electrónico no registrado."
    ]);
    exit;
}

if (!password_verify($password, $usuario['contrasena_hash'])) {
    echo json_encode([
        "success" => false,
        "message" => "Contraseña incorrecta."
    ]);
    exit;
}

unset($usuario['contrasena_hash']);

echo json_encode([
    "success" => true,
    "message" => "Inicio de sesión exitoso.",
    "usuario" => $usuario
]);

?>