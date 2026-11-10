
<? 
php

// conexion de la base de datos
define('DB_USER', 'YOUR_DB_USER');
define('DB_PASS', 'YOUR_DB_PASSWORD');

// llaves wompi 
define('WOMPI_PUBLIC_KEY', '');
define('WOMPI_PRIVATE_KEY', '');
define('WOMPI_EVENTS_SECRET', '');
define('WOMPI_INTEGRITY_SECRET', '');
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
