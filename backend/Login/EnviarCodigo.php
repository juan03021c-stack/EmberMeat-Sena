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
require_once "../Config/EnviarCorreo.php";

$datos = json_decode(file_get_contents("php://input"), true);
$email = trim($datos["email"] ?? "");

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ingresa un correo electrónico válido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nombre FROM usuarios WHERE correo = ? AND activo = 1 LIMIT 1");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si el correo no existe se responde igual, para no revelar qué correos están registrados
    if ($usuario) {
        $codigo = str_pad((string)random_int(0, 999999), 6, "0", STR_PAD_LEFT);

        $stmt = $pdo->prepare(
            "UPDATE usuarios
             SET codigo_recuperacion = ?, codigo_expira = NOW() + INTERVAL 15 MINUTE
             WHERE id = ?"
        );
        $stmt->execute([$codigo, $usuario["id"]]);

        enviarCorreo(
            $email,
            $usuario["nombre"],
            "Código para recuperar tu contraseña",
            "<h2>Hola, " . htmlspecialchars($usuario["nombre"]) . "</h2>"
                . "<p>Tu código para cambiar la contraseña es:</p>"
                . "<h1>$codigo</h1>"
                . "<p>Vence en 15 minutos. Si no lo pediste, ignora este correo.</p>"
        );
    }

    echo json_encode([
        "success" => true,
        "message" => "Si el correo está registrado, te llegará un código en unos segundos."
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error en EnviarCodigo.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "No fue posible enviar el código. Inténtalo nuevamente."]);
}
