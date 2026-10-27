<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../Config/Database.php";

$datos = $_POST;
if (empty($datos)) {
    $input = file_get_contents("php://input");
    $json = json_decode($input, true);
    if (is_array($json)) {
        $datos = $json;
    }
}

$id = $datos['id'] ?? $_GET['id'] ?? '';

if (
    !is_scalar($id) ||
    !ctype_digit((string) $id) ||
    (int) $id <= 0
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "El ID del producto no es válido."
    ]);
    exit;
}

$id = (int) $id;

// Determinar el nuevo estado (0 = inhabilitar por defecto, 1 = habilitar)
$nuevoEstado = 0;
if (isset($datos['activo'])) {
    $nuevoEstado = in_array((string)$datos['activo'], ['1', 'true'], true) ? 1 : 0;
} elseif (isset($datos['activa'])) {
    $nuevoEstado = in_array((string)$datos['activa'], ['1', 'true'], true) ? 1 : 0;
} elseif (isset($_GET['activo'])) {
    $nuevoEstado = in_array((string)$_GET['activo'], ['1', 'true'], true) ? 1 : 0;
}

try {
    $consulta = $pdo->prepare(
        "SELECT id, activo, nombre
         FROM productos
         WHERE id = :id
         LIMIT 1"
    );

    $consulta->execute([':id' => $id]);
    $producto = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "El producto no existe."
        ]);
        exit;
    }

    if ((int) $producto['activo'] === $nuevoEstado) {
        $estadoTexto = $nuevoEstado === 1 ? "activado" : "desactivado";
        echo json_encode([
            "success" => true,
            "message" => "El producto ya se encuentra {$estadoTexto}."
        ]);
        exit;
    }

    $actualizar = $pdo->prepare(
        "UPDATE productos
         SET activo = :activo
         WHERE id = :id"
    );

    $actualizar->execute([
        ':activo' => $nuevoEstado,
        ':id' => $id
    ]);

    if ($actualizar->rowCount() > 0) {
        $accionTexto = $nuevoEstado === 1 ? "activado" : "desactivado";
        echo json_encode([
            "success" => true,
            "message" => "Producto {$accionTexto} correctamente.",
            "id" => $id,
            "activo" => $nuevoEstado
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se pudo cambiar el estado del producto."
        ]);
    }

} catch (PDOException $error) {
    error_log("Error al cambiar estado de producto: " . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al cambiar el estado del producto en la base de datos."
    ]);
} catch (Throwable $error) {
    error_log("Error del servidor: " . $error->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno en el servidor."
    ]);
}
