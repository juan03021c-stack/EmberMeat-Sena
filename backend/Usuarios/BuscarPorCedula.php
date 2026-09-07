<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../Config/Database.php";

$cedula = $_GET['cedula'] ?? '';
/**
 * si no se recibe la cedula entonces se muestra un error
 */
if (empty($cedula)) {
    echo json_encode(["success" => false, "message" => "Cédula requerida"]);
    exit;
}

try {
    
    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.nombre, 
            u.correo AS email, 
            u.telefono,
            u.cedula,
            dc.direccion
        FROM usuarios u
        LEFT JOIN direcciones_cliente dc 
            ON u.id = dc.usuario_id 
            AND dc.activa = 1 
            AND dc.es_principal = 1
        WHERE u.cedula = :cedula
        LIMIT 1
    ");
    
    $stmt->execute([':cedula' => trim($cedula)]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cliente) {
        echo json_encode([
            "success"    => true,
            "encontrado" => true,
            "data"       => [
                "nombre"    => $cliente['nombre'],
                "email"     => $cliente['email'],
                "telefono"  => $cliente['telefono'] ?? '',
                "direccion" => $cliente['direccion'] ?? '',
                "cedula"    => $cliente['cedula']
            ]
        ]);
    } else {
        echo json_encode([
            "success"    => true,
            "encontrado" => false,
            "data"       => null
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al buscar: " . $e->getMessage()
    ]);
}