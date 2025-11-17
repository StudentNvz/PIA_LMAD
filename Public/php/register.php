<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {

    require_once __DIR__ . "/../../App/controllers/RegisterController.php";
    

    $required = ['nombreCompleto', 'fechaNacimiento', 'genero', 'paisNacimiento', 'nacionalidad', 'email', 'password'];
    
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }
    

    require_once __DIR__ . "/../../App/models/Usuario.php";
    $usuarioModel = new Usuario();
    $usuarioExistente = $usuarioModel->getByEmail($_POST['email']);
    
    if ($usuarioExistente) {
        throw new Exception("Ya existe un usuario con ese correo electrónico");
    }
    
 
    $fechaNac = new DateTime($_POST['fechaNacimiento']);
    $hoy = new DateTime();
    $edad = $hoy->diff($fechaNac)->y;
    
    if ($edad < 12) {
        throw new Exception("Debes ser mayor de 12 años para registrarte");
    }
    

    $controller = new RegisterController();
    $result = $controller->register($_POST, $_FILES);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado exitosamente'
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Error al registrar usuario'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>