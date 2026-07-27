<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../Config/Database.php";

$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$rolId = $_POST['rol_id'] ?? '';
$activo = isset($_POST['activo']) ? (((int)$_POST['activo']) === 0 ? 0 : 1) : 1;

$password = trim($_POST['contrasena'] ?? '');
$hashPassword = !empty($password)
    ? password_hash($password, PASSWORD_DEFAULT)
    : password_hash('Cambiar123!', PASSWORD_DEFAULT);

if (empty($nombre) || empty($correo)) {
    echo json_encode([
        "success" => false,
        "message" => "El nombre y el correo son obligatorios"
    ]);
    exit;
}


if (strlen($nombre) > 255) {
    echo json_encode([
        "success" => false,
        "message" => "El nombre no puede exceder 255 caracteres"
    ]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "El correo electrónico no es válido"
    ]);
    exit;
}

if ($telefono !== '' && !preg_match('/^\d{10}$/', $telefono)) {
    echo json_encode([
        "success" => false,
        "message" => "El número de teléfono debe tener 10 dígitos"
    ]);
    exit;
}

if ($rolId === '' || !is_numeric($rolId)) {
    echo json_encode([
        "success" => false,
        "message" => "Debe seleccionar un rol válido"
    ]);
    exit;
}

$rolId = (int)$rolId;

try {
   
    $pdo->beginTransaction();

    $checkRole = $pdo->prepare("SELECT id FROM roles WHERE id = :id");
    $checkRole->execute([':id' => $rolId]);
    if (!$checkRole->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "El rol seleccionado no existe"
        ]);
        exit;
    }

    $checkCorreo = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :correo LIMIT 1");
    $checkCorreo->execute([':correo' => $correo]);
    if ($checkCorreo->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "El correo electrónico ya está registrado"
        ]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO usuarios (nombre, correo, telefono, rol_id, activo, contrasena_hash)
         VALUES (:nombre, :correo, :telefono, :rol_id, :activo, :contrasena_hash)"
    );

    $stmt->execute([
        ':nombre' => $nombre,
        ':correo' => $correo,
        ':telefono' => $telefono !== '' ? $telefono : null,
        ':rol_id' => $rolId,
        ':activo' => $activo,
        ':contrasena_hash' => $hashPassword
    ]);

    $pdo->commit();

   
    /*
    $nuevoId = $pdo->lastInsertId();
    $usuarioStmt = $pdo->prepare(
        "SELECT u.*, r.nombre AS rol_nombre
         FROM usuarios u
         INNER JOIN roles r ON u.rol_id = r.id
         WHERE u.id = :id"
    );
    $usuarioStmt->execute([':id' => $nuevoId]);
    $usuarioCreado = $usuarioStmt->fetch(PDO::FETCH_ASSOC);
    */

    echo json_encode([
        "success" => true,
        "message" => "Usuario creado correctamente"
        
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Error al crear el usuario. Intente más tarde."
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor. Intente más tarde."
    ]);
}