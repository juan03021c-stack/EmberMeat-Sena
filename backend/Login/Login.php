
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../Config/Database.php";

/* recibe los datos del frontend*/
$datos = json_decode(file_get_contents('php://input'), true);

/* se extraen los datos del frontend*/
$email = $datos['email'] ?? '';
$password = $datos['password'] ?? '';

/* valida que se reciba el correo y la contraseña*/
if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos de inicio de sesión."
    ]);
    exit;
}
/* se consulta la tabla usuarios*/
$sql = "SELECT id, rol_id, nombre, correo, contrasena_hash FROM usuarios WHERE correo = ?";
/* se ejecuta la consulta*/
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);

/* se obtiene el usuario*/
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

/* valida que el usuario exista*/
if (!$usuario) {
    echo json_encode([
        "success" => false,
        "message" => "Correo electrónico no registrado."
    ]);
    exit;
}

/* valida que la contraseña sea correcta*/
if (!password_verify($password, $usuario['contrasena_hash'])) {
    echo json_encode([
        "success" => false,
        "message" => "Contraseña incorrecta."
    ]);
    exit;
}
/* se elimina la contraseña del array de respuesta*/
unset($usuario['contrasena_hash']);
/* se envia la respuesta al frontend*/
echo json_encode([
    "success" => true,
    "message" => "Inicio de sesión exitoso.",
    "usuario" => $usuario
]);

?>