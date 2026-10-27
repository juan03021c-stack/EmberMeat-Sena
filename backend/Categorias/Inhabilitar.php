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

// Recibir datos del formulario o JSON
$datos = $_POST;

if (empty($datos)) {
    $input = file_get_contents("php://input");
    $json = json_decode($input, true);

    if (is_array($json)) {
        $datos = $json;
    }
}

// Obtener ID de la categoría
$id = $datos['id'] ?? $_GET['id'] ?? '';

if (
    !is_scalar($id) ||
    !ctype_digit((string) $id) ||
    (int) $id <= 0
) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "El ID de la categoría no es válido."
    ]);

    exit;
}

$id = (int) $id;

// Determinar el nuevo estado (0 = inhabilitar por defecto, 1 = habilitar)
$nuevoEstado = 0;
if (isset($datos['activa'])) {
    $nuevoEstado = in_array((string)$datos['activa'], ['1', 'true'], true) ? 1 : 0;
} elseif (isset($datos['activo'])) {
    $nuevoEstado = in_array((string)$datos['activo'], ['1', 'true'], true) ? 1 : 0;
} elseif (isset($_GET['activa'])) {
    $nuevoEstado = in_array((string)$_GET['activa'], ['1', 'true'], true) ? 1 : 0;
}

try {
    // Verificar que la categoría exista
    $consulta = $pdo->prepare(
        "SELECT id, activa
         FROM categorias
         WHERE id = :id
         LIMIT 1"
    );

    $consulta->execute([
        ':id' => $id
    ]);

    $categoria = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$categoria) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "La categoría no existe."
        ]);

        exit;
    }

    // Verificar si ya está en el estado deseado
    if ((int) $categoria['activa'] === $nuevoEstado) {
        $estadoTexto = $nuevoEstado === 1 ? "activada" : "desactivada";
        echo json_encode([
            "success" => true,
            "message" => "La categoría ya se encuentra {$estadoTexto}."
        ]);

        exit;
    }

    // Actualizar el estado de la categoría
    $actualizar = $pdo->prepare(
        "UPDATE categorias
         SET activa = :activa
         WHERE id = :id"
    );

    $actualizar->execute([
        ':activa' => $nuevoEstado,
        ':id' => $id
    ]);

    if ($actualizar->rowCount() > 0) {
        $accionTexto = $nuevoEstado === 1 ? "activada" : "desactivada";
        echo json_encode([
            "success" => true,
            "message" => "Categoría {$accionTexto} correctamente."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se pudo cambiar el estado de la categoría."
        ]);
    }

} catch (PDOException $error) {
    error_log(
        "Error al cambiar estado de categoría: " . $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Error al cambiar el estado de la categoría en la base de datos."
    ]);

} catch (Throwable $error) {
    error_log(
        "Error del servidor: " . $error->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Error interno en el servidor."
    ]);
}
