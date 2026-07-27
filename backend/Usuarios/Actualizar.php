<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../Config/Database.php";

$id = $_POST['id'] ?? null;
if (empty($id) || !is_numeric($id)) {
    echo json_encode([
        "success" => false,
        "message" => "El ID del usuario es obligatorio y debe ser numérico."
    ]);
    exit;
}
$id = (int)$id;

$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$rolId = $_POST['rol_id'] ?? '';
$activo = isset($_POST['activo']) ? (((int)$_POST['activo']) === 0 ? 0 : 1) : 1;
$nuevaContrasena = trim($_POST['contrasena'] ?? '');

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

    $checkUsuario = $pdo->prepare("SELECT id FROM usuarios WHERE id = :id LIMIT 1");
    $checkUsuario->execute([':id' => $id]);
    if (!$checkUsuario->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Usuario no encontrado."
        ]);
        exit;
    }

    $checkRole = $pdo->prepare("SELECT id FROM roles WHERE id = :id LIMIT 1");
    $checkRole->execute([':id' => $rolId]);
    if (!$checkRole->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "El rol seleccionado no existe"
        ]);
        exit;
    }


    $checkCorreo = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :correo AND id != :id LIMIT 1");
    $checkCorreo->execute([':correo' => $correo, ':id' => $id]);
    if ($checkCorreo->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "El correo electrónico ya está en uso por otro usuario"
        ]);
        exit;
    }

    $params = [
        ':nombre' => $nombre,
        ':correo' => $correo,
        ':telefono' => $telefono !== '' ? $telefono : null,
        ':rol_id' => $rolId,
        ':activo' => $activo,
        ':id' => $id
    ];

    $sql = "UPDATE usuarios
        SET nombre = :nombre,
            correo = :correo,
            telefono = :telefono,
            rol_id = :rol_id,
            activo = :activo";

    if ($nuevaContrasena !== '') {
        $sql .= ", contrasena_hash = :contrasena_hash";
        $params[':contrasena_hash'] = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
    }

    $sql .= " WHERE id = :id";

    $sentencia = $pdo->prepare($sql);
    $sentencia->execute($params);

    if ($sentencia->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "No se realizaron cambios. Los datos son idénticos."
        ]);
        exit;
    }

    $pdo->commit();


    echo json_encode([
        "success" => true,
        "message" => "Usuario actualizado correctamente",
        "id" => $id
    ]);
} catch (PDOException $error) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Error en la base de datos. Intente más tarde."
    ]);
} catch (Exception $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor. Intente más tarde."
    ]);
}
