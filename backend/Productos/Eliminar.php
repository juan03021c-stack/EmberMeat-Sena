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
        "message" => "El ID del producto es obligatorio y debe ser numérico."
    ]);
    exit;
}

$id = (int)$id;

try {
    $pdo->beginTransaction();

    $sentencia = $pdo->prepare("SELECT imagen_url FROM productos WHERE id = :id LIMIT 1");
    $sentencia->execute([':id' => $id]);
    $producto = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Producto no encontrado."
        ]);
        exit;
    }

    if (!empty($producto['imagen_url'])) {

        $rutaBase = dirname(__DIR__);
        $rutaArchivo = $rutaBase . '/' . $producto['imagen_url'];

        if (is_file($rutaArchivo)) {
            unlink($rutaArchivo);
        }
    }

    $sentenciaEliminar = $pdo->prepare("DELETE FROM productos WHERE id = :id");
    $sentenciaEliminar->execute([':id' => $id]);
    
    if ($sentenciaEliminar->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "No se pudo eliminar el producto. Puede que ya no exista."
        ]);
        exit;
    }

    $pdo->commit();
    echo json_encode([
        "success" => true,
        "message" => "Producto eliminado correctamente",
        "id" => $id
    ]);

}  catch (Exception $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor. Intente más tarde."
    ]);
}