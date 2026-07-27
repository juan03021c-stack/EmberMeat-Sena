<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");
 
if($_SERVER["REQUEST_METHOD"] === 'OPTIONS'){
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
 
 try{
    $pdo->beginTransaction();
    $sentencia = $pdo->prepare("SELECT id FROM usuarios WHERE id = :id LIMIT 1");
    $sentencia->execute([':id' => $id]);
    $usuario = $sentencia->fetch(PDO::FETCH_ASSOC); 
    
    if(!$usuario) {
        $pdo ->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Usuario no encontrado."
        ]);
        exit; 
    }  
    
    $sentenciaEliminar = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
    $sentenciaEliminar->execute([':id' => $id]);
    
    if ($sentenciaEliminar->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "No se pudo eliminar el usuario. Puede que ya no exista."
        ]);
        exit;
    }
    
    $pdo->commit();
    echo json_encode([
        "success" => true,
        "message" => "Usuario eliminado correctamente"
    ]);
 }catch(Exception $error){
    if($pdo->inTransaction()){
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Error al eliminar el usuario. Intente más tarde."
    ]);
 }
?>