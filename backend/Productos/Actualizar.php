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
$nombre = $_POST['nombre'] ?? '';
$categoriaId = $_POST['categoria_id'] ?? '';
$nuevaCategoria = $_POST['nueva_categoria'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? null;
$presentacion = $_POST['presentacion'] ?? '';
$stock = $_POST['stock'] ?? 0;
$umbralMinimo = $_POST['umbral_minimo'] ?? 5;
$activo = isset($_POST['activo']) ? (int)$_POST['activo'] : 1;

if (empty($id) || trim($nombre) === '' || $precio === null || $precio === '') {
    echo json_encode([
        "success" => false,
        "message" => "Faltan campos obligatorios: id, nombre, precio"
    ]);
    exit;
}
$precio = (float)$precio;
$stock = (int)$stock;
$umbralMinimo = (int)$umbralMinimo;

if ($precio < 0 || $stock < 0 || $umbralMinimo < 0) {
    echo json_encode([
        "success" => false,
        "message" => "Los campos numéricos no pueden ser negativos"
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $sentenciaComprobacion = $pdo->prepare("SELECT imagen_url FROM productos WHERE id = :id LIMIT 1");
    $sentenciaComprobacion->execute([':id' => $id]);
    $productoExistente = $sentenciaComprobacion->fetch(PDO::FETCH_ASSOC);

    if (!$productoExistente) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Producto no encontrado."
        ]);
        exit;
    }

    $imagenUrl = $productoExistente['imagen_url'];

    $idCategoriaFinal = null;
    if ($categoriaId === 'new' && !empty($nuevaCategoria)) {
        $sentenciaCategoria = $pdo->prepare("SELECT id FROM categorias WHERE nombre = :nombre LIMIT 1");
        $sentenciaCategoria->execute([':nombre' => $nuevaCategoria]);
        $categoria = $sentenciaCategoria->fetch(PDO::FETCH_ASSOC);

        if ($categoria) {
            $idCategoriaFinal = (int)$categoria['id'];
        } else {
            $insertarCategoria = $pdo->prepare("INSERT INTO categorias (nombre) VALUES (:nombre)");
            $insertarCategoria->execute([':nombre' => $nuevaCategoria]);
            $idCategoriaFinal = (int)$pdo->lastInsertId();
        }
    } else if (!empty($categoriaId) && is_numeric($categoriaId)) {
        $idCategoriaFinal = (int)$categoriaId;
    } else {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Debe seleccionar o ingresar una categoría válida."
        ]);
        exit;
    }

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $tamañoMaximo = 5 * 1024 * 1024; // 5MB
        if ($_FILES['imagen']['size'] > $tamañoMaximo) {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "La imagen excede el tamaño máximo permitido (5MB)."
            ]);
            exit;
        }

        $rutaTemporalArchivo = $_FILES['imagen']['tmp_name'];
        $nombreArchivo = $_FILES['imagen']['name'];

      
        $extensionArchivo = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (in_array($extensionArchivo, $extensionesPermitidas)) {
            $directorioCarga = '../uploads/';

       
            if (!is_dir($directorioCarga)) {
                $pdo->rollBack();
                echo json_encode([
                    "success" => false,
                    "message" => "Directorio de uploads no configurado. Contacte al administrador."
                ]);
                exit;
            }

           
            $nuevoNombreArchivo = uniqid() . bin2hex(random_bytes(8)) . '.' . $extensionArchivo;
            $rutaDestino = $directorioCarga . $nuevoNombreArchivo;

            if (move_uploaded_file($rutaTemporalArchivo, $rutaDestino)) {
                if (!empty($productoExistente['imagen_url'])) {
                    /*
                       Eliminado: '../' . $imagenUrl.
                       Eso asumía que el script siempre está a 1 nivel de profundidad.
                       Si movías el archivo PHP, las rutas se rompían.
                       Ahora usamos dirname(__DIR__) que siempre apunta al padre del script actual.
                    */
                    $rutaBase = dirname(__DIR__);
                    $rutaArchivoViejo = $rutaBase . '/' . $productoExistente['imagen_url'];
                    if (file_exists($rutaArchivoViejo) && is_file($rutaArchivoViejo)) {
                        unlink($rutaArchivoViejo);
                    }
                }

                $imagenUrl = 'uploads/' . $nuevoNombreArchivo;
            } else {
                $pdo->rollBack();
                echo json_encode([
                    "success" => false,
                    "message" => "Error al guardar la nueva imagen en el servidor."
                ]);
                exit;
            }
        } else {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Extensión de imagen no permitida. Formatos válidos: JPG, PNG, WEBP, GIF."
            ]);
            exit;
        }
    }

    $sentencia = $pdo->prepare(
        "UPDATE productos
         SET nombre = :nombre,
             descripcion = :descripcion,
             precio = :precio,
             presentacion = :presentacion,
             stock = :stock,
             umbral_minimo = :umbral_minimo,
             activo = :activo,
             imagen_url = :imagen_url,
             categoria_id = :categoria_id
         WHERE id = :id"
    );

    $sentencia->execute([
        ':nombre' => $nombre,
        ':descripcion' => $descripcion,
        ':precio' => $precio,
        ':presentacion' => $presentacion,
        ':stock' => $stock,
        ':umbral_minimo' => $umbralMinimo,
        ':activo' => $activo,
        ':imagen_url' => $imagenUrl,
        ':categoria_id' => $idCategoriaFinal,
        ':id' => $id
    ]);

    $pdo->commit();

   
    /*
    $sentenciaProducto = $pdo->prepare(
        "SELECT p.*, c.nombre AS categoria_nombre
         FROM productos p
         INNER JOIN categorias c ON p.categoria_id = c.id
         WHERE p.id = :id LIMIT 1"
    );
    $sentenciaProducto->execute([':id' => $id]);
    $productoActualizado = $sentenciaProducto->fetch(PDO::FETCH_ASSOC);
    */

    echo json_encode([
        "success" => true,
        "message" => "Producto actualizado correctamente"
        
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