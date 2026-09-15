<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../Config/Database.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insertar la venta principal en la tabla 'ventas'
    $stmt = $pdo->prepare("
        INSERT INTO ventas 
            (cliente, vendedor_id, canal, metodo_pago, descuento, subtotal, total) 
        VALUES 
            (:cliente, :vendedor_id, :canal, :metodo_pago, :descuento, :subtotal, :total)
    ");

    $stmt->execute([
        ":cliente"      => $data["cliente"] ?? '',
        ":vendedor_id" => !empty($data["vendedor_id"]) ? $data["vendedor_id"] : null,
        ":canal"        => $data["canal"] ?? 'Punto de venta',
        ":metodo_pago"  => $data["metodo_pago"] ?? 'Efectivo',
        ":descuento"    => $data["descuento"] ?? 0,
        ":subtotal"     => $data["subtotal"] ?? 0,
        ":total"        => $data["total"] ?? 0
    ]);

    $ventaId = $pdo->lastInsertId();

    // 2. Insertar cada producto en la tabla 'venta_detalle'
    if (!empty($data["productos"]) && is_array($data["productos"])) {
        $stmtDetalle = $pdo->prepare("
            INSERT INTO venta_detalle 
                (venta_id, producto_id, nombre, precio, cantidad) 
            VALUES 
                (:venta_id, :producto_id, :nombre, :precio, :cantidad)
        ");

        foreach ($data["productos"] as $producto) {
            $stmtDetalle->execute([
                ":venta_id"    => $ventaId,
                ":producto_id" => $producto["producto_id"] ?? 0,
                ":nombre"      => $producto["nombre"] ?? '',
                ":precio"      => $producto["precio"] ?? 0,
                ":cantidad"    => $producto["cantidad"] ?? 1
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(["success" => true, "venta_id" => $ventaId]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
} // ESTE FUNCIONAA


