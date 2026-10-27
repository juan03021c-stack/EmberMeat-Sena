
<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido."
    ]);
    exit;
}

require_once "../Config/Database.php";

try {
    $datos = json_decode(file_get_contents("php://input"), true);

    if (!is_array($datos)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Los datos enviados no son válidos."
        ]);
        exit;
    }

    $email = trim($datos["email"] ?? "");
    $password = $datos["password"] ?? "";

    if ($email === "" || !is_string($password) || $password === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Ingresa tu correo electrónico y contraseña."
        ]);
        exit;
    }

    $sql = "SELECT
                u.id,
                u.rol_id,
                u.nombre,
                u.correo,
                u.contrasena_hash,
                u.activo,
                r.nombre AS rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.correo = ?
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Correo electrónico o contraseña incorrectos."
        ]);
        exit;
    }

    if ((int)($usuario["activo"] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Tu cuenta está inhabilitada. Comunícate con el administrador."
        ]);
        exit;
    }

    if (!password_verify($password, $usuario["contrasena_hash"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Correo electrónico o contraseña incorrectos."
        ]);
        exit;
    }

    $rol = strtolower(trim($usuario["rol_nombre"] ?? ""));

    $rolesPermitidos = [
        "administrador",
        "vendedor",
        "repartidor"
    ];

    if (!in_array($rol, $rolesPermitidos, true)) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "No tienes permisos para ingresar al panel administrativo."
        ]);
        exit;
    }

    unset($usuario["contrasena_hash"]);

    $usuario["rol_nombre"] = $rol;

    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso.",
        "usuario" => $usuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);

    // El detalle técnico se registra en el servidor, no se expone al usuario.
    error_log("Error en Login.php: " . $e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "No fue posible iniciar sesión. Inténtalo nuevamente."
    ]);
}
