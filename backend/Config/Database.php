<?php

// conexion de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'embermeat3');
define('DB_USER', 'root');
define('DB_PASS', '');

// llaves wompi 
define('WOMPI_PUBLIC_KEY', 'pub_test_L9vvUhuKx6eGalQpeby6wmFXMgFeiTvi');
define('WOMPI_PRIVATE_KEY', 'prv_test_pK180eXCLAxae7q1nT8K4gNnSPlPVoOX');
define('WOMPI_EVENTS_SECRET', 'test_events_hGnmHuJbQzypt7UrNw1wDHpppbs2rXZJ');
define('WOMPI_INTEGRITY_SECRET', 'test_integrity_obaNkK6JwKldXoU5Q4yY4ftCWhprOnSy');
define('WOMPI_CURRENCY', 'COP');




try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}