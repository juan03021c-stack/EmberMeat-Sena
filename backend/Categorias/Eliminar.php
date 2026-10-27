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
    !ctype_digit((string)$id) ||
    (int)$id <= 0
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "El ID de la categoría no es válido."
    ]);
    exit;
}

$id = (int) $id;

try {
    // Comprobar que la categoría exista
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

    // Comprobar si ya está desactivada
    if ((int)$categoria['activa'] === 0) {
        echo json_encode([
            "success" => true,
            "message" => "La categoría ya se encuentra desactivada."
        ]);
        exit;
    }

    // Desactivar la categoría (soft delete)
    $actualizar = $pdo->prepare(
        "UPDATE categorias
         SET activa = 0
         WHERE id = :id"
    );

    $actualizar->execute([
        ':id' => $id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Categoría desactivada correctamente."
    ]);

} catch (PDOException $error) {
    error_log(
        "Error al desactivar categoría: " . $error->getMessage()
    );

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al desactivar la categoría en la base de datos."
    ]);
} catch (Throwable $error) {
    error_log("Error del servidor: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno en el servidor."
    ]);
}
