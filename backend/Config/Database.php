<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "embermeat3";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8mb4",
        $username,
        $password
    );
    
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $e->getMessage()]);
    exit;
}