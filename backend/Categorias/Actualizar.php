<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido."
    ]);
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

$id = $datos['id'] ?? null;
$nombre = trim($datos['nombre'] ?? '');
$descripcion = trim($datos['descripcion'] ?? '');
$activa = $datos['activa'] ?? $datos['activo'] ?? $datos['estado'] ?? '1';

if (
    !is_scalar($id) ||
    !ctype_digit((string)$id) ||
    (int)$id <= 0 ||
    $nombre === ''
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "El ID y el nombre de la categoría son obligatorios."
    ]);
    exit;
}

$id = (int) $id;
$activa = in_array((string)$activa, ['0', 'false'], true) ? 0 : 1;

try {
    $pdo->beginTransaction();

    // Verificar que la categoría exista
    $sentenciaComprobacion = $pdo->prepare(
        "SELECT id FROM categorias WHERE id = :id LIMIT 1"
    );

    $sentenciaComprobacion->execute([
        ':id' => $id
    ]);

    if (!$sentenciaComprobacion->fetch(PDO::FETCH_ASSOC)) {
        $pdo->rollBack();

        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Categoría no encontrada."
        ]);
        exit;
    }

    // Verificar si otro registro ya tiene el mismo nombre
    $checkNombre = $pdo->prepare(
        "SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(:nombre) AND id != :id LIMIT 1"
    );
    $checkNombre->execute([
        ':nombre' => $nombre,
        ':id' => $id
    ]);
    if ($checkNombre->fetch()) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "Ya existe otra categoría con ese nombre."
        ]);
        exit;
    }

    // Actualizar los datos de la categoría (usando la columna 'activa')
    $sentencia = $pdo->prepare(
        "UPDATE categorias
         SET nombre = :nombre,
             descripcion = :descripcion,
             activa = :activa
         WHERE id = :id"
    );

    $sentencia->execute([
        ':nombre' => $nombre,
        ':descripcion' => $descripcion !== '' ? $descripcion : null,
        ':activa' => $activa,
        ':id' => $id
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Categoría actualizada correctamente."
    ]);

} catch (PDOException $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Error actualizando categoría: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en la base de datos al actualizar la categoría."
    ]);

} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Error del servidor: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor. Intente más tarde."
    ]);
}
