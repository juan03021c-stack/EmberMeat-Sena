<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../Config/Database.php';

try {
    $stmt = $pdo->query('SELECT id, nombre FROM roles ORDER BY id');
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'roles' => $roles]);
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener roles: ' . $e->getMessage()
    ]);
}
