<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../Config/Database.php";

try {
    // 1. Traer todas las ventas, de la más reciente a la más antigua
    $stmt = $pdo->query(
        "SELECT v.*, u.nombre AS vendedor
         FROM ventas v
         LEFT JOIN usuarios u ON u.id = v.vendedor_id
         ORDER BY v.created_at DESC"
    );
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Para cada venta, traer sus productos del detalle
    $stmtDetalle = $pdo->prepare("SELECT * FROM venta_detalle WHERE venta_id = ?");
    foreach ($ventas as &$venta) {
        $stmtDetalle->execute([$venta["id"]]);
        $venta["productos"] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(["success" => true, "ventas" => $ventas]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}