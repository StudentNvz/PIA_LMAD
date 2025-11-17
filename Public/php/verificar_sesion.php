<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if(session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

try {
    if (isset($_SESSION['usuario_email']) && isset($_SESSION['usuario_nombre'])) {
        echo json_encode([
            'status' => 'success',
            'usuario' => [
                'id_usuario' => $_SESSION['usuario_id'] ?? null,
                'correo' => $_SESSION['usuario_email'],
                'nombre_completo' => $_SESSION['usuario_nombre'],
                'rol' => $_SESSION['usuario_rol'] ?? 'usuario'
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No hay sesión activa'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>