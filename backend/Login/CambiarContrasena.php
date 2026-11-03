<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "../Config/Database.php";

$datos = json_decode(file_get_contents("php://input"), true);
$email = trim($datos["email"] ?? "");
$codigo = trim($datos["codigo"] ?? "");
$password = $datos["password"] ?? "";

if ($email === "" || $codigo === "" || !is_string($password) || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Completa los datos. La contraseña debe tener mínimo 6 caracteres."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT id FROM usuarios
         WHERE correo = ? AND codigo_recuperacion = ? AND codigo_expira > NOW()
         LIMIT 1"
    );
    $stmt->execute([$email, $codigo]);
    $usuarioId = $stmt->fetchColumn();

    if (!$usuarioId) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El código no es válido o ya venció."]);
        exit;
    }

    // Se borra el código para que no se pueda usar dos veces
    $stmt = $pdo->prepare(
        "UPDATE usuarios
         SET contrasena_hash = ?, codigo_recuperacion = NULL, codigo_expira = NULL
         WHERE id = ?"
    );
    $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $usuarioId]);

    echo json_encode(["success" => true, "message" => "Contraseña actualizada. Ya puedes iniciar sesión."]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error en CambiarContrasena.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "No fue posible cambiar la contraseña. Inténtalo nuevamente."]);
}
