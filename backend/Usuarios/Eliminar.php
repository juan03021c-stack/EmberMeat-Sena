<?php

// Reenviar a Inhabilitar.php para realizar baja lógica (soft delete) en lugar de eliminar físico
$_POST['activo'] = 0;
require_once __DIR__ . '/Inhabilitar.php';