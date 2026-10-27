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

// Soportar tanto FormData ($_POST) como JSON en el cuerpo de la petición
$datos = $_POST;
if (empty($datos)) {
    $input = file_get_contents("php://input");
    $json = json_decode($input, true);
    if (is_array($json)) {
        $datos = $json;
    }
}

$nombre = trim($datos['nombre'] ?? '');
$descripcion = trim($datos['descripcion'] ?? '');
$activa = $datos['activa'] ?? $datos['activo'] ?? $datos['estado'] ?? '1';

if ($nombre === '') {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "El nombre de la categoría es obligatorio."
    ]);
    exit;
}

// Convertir estado a 1 o 0
$activa = in_array((string)$activa, ['0', 'false'], true) ? 0 : 1;

try {
    // Comprobar si ya existe una categoría con ese nombre
    $comprobar = $pdo->prepare(
        "SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1"
    );
    $comprobar->execute([':nombre' => $nombre]);

    if ($comprobar->fetch()) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "Ya existe una categoría con ese nombre."
        ]);
        exit;
    }

    // Insertar la nueva categoría
    $insertar = $pdo->prepare(
        "INSERT INTO categorias (nombre, descripcion, activa)
         VALUES (:nombre, :descripcion, :activa)"
    );

    $insertar->execute([
        ':nombre' => $nombre,
        ':descripcion' => $descripcion !== '' ? $descripcion : null,
        ':activa' => $activa
    ]);

    $nuevoId = (int)$pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Categoría creada correctamente.",
        "id" => $nuevoId,
        "categoria" => [
            "id" => $nuevoId,
            "nombre" => $nombre,
            "descripcion" => $descripcion,
            "activa" => $activa
        ]
    ]);

} catch (PDOException $error) {
    error_log("Error al crear categoría: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en la base de datos al crear la categoría."
    ]);
} catch (Throwable $error) {
    error_log("Error del servidor: " . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor. Intente más tarde."
    ]);
}