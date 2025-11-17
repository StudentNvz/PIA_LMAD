<?php
require_once __DIR__ . '/../models/Usuario.php';

class LoginController {
    private $usuarioModel;

    public function __construct() {
        $this->usuarioModel = new Usuario();
    }

    public function login(string $email, string $password): array {
        try {
            $usuario = $this->usuarioModel->verificarPassword($email, $password);

            if ($usuario) {
                if(session_status() !== PHP_SESSION_ACTIVE) session_start();
                
                $_SESSION['usuario_id'] = $usuario['id_usuario'];
                $_SESSION['usuario_email'] = $usuario['correo'];
                $_SESSION['usuario_nombre'] = $usuario['nombre_completo'];
                $_SESSION['usuario_rol'] = $usuario['rol']; 
                
                return [
                    'status' => 'success',
                    'message' => 'Login exitoso',
                    'user' => [
                        'id' => $usuario['id_usuario'],
                        'nombre_completo' => $usuario['nombre_completo'],
                        'correo' => $usuario['correo'],
                        'rol' => $usuario['rol'] 
                    ]
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Credenciales incorrectas'
                ];
            }
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error interno: ' . $e->getMessage()
            ];
        }
    }
}