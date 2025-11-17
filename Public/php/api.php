<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . "/../../App/controllers/RegisterController.php";
require_once __DIR__ . "/../../App/controllers/LoginController.php";
require_once __DIR__ . "/../../App/models/Database.php";

$response = ["status" => "error", "message" => "Error desconocido"];

try {
    $endpoint = $_GET['endpoint'] ?? '';
    
    error_log("API Call - Method: " . $_SERVER['REQUEST_METHOD'] . ", Endpoint: " . $endpoint);

    if ($endpoint === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $nombre = $_POST['nombreCompleto'] ?? '';
        $fechaNacimiento = $_POST['fechaNacimiento'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (
            strlen($password) < 8 ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/\d/', $password) ||
            !preg_match('/[!@#$%^&*(),.?:{}|<>_\-+=~`]/', $password)
        ) {
            $response = [
                "status" => "error",
                "message" => "La contraseña no cumple los requisitos"
            ];
            echo json_encode($response);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response = [
                "status" => "error",
                "message" => "El correo electrónico no es válido"
            ];
            echo json_encode($response);
            exit;
        }

        $edad = 0;
        if ($fechaNacimiento) {
            $hoy = new DateTime();
            $nacimiento = new DateTime($fechaNacimiento);
            $edad = $hoy->diff($nacimiento)->y;
        }
        if ($edad < 12) {
            $response = [
                "status" => "error",
                "message" => "Debes tener al menos 12 años para registrarte"
            ];
            echo json_encode($response);
            exit;
        }

        $controller = new RegisterController();
        $ok = $controller->register($_POST, $_FILES);

        $response = [
            "status" => $ok ? "success" : "error",
            "message" => $ok ? "Usuario registrado correctamente" : "Error al registrar usuario"
        ];
        echo json_encode($response);
        exit;
    } elseif ($endpoint === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        error_log("Login attempt - Email: " . $email);

        if (empty($email) || empty($password)) {
            $response = [
                "status" => "error",
                "message" => "Email y contraseña son requeridos"
            ];
        } else {
            $loginController = new LoginController();
            $loginResult = $loginController->login($email, $password);
            
            error_log("Login result: " . json_encode($loginResult));
            
            $response = $loginResult;
        }

    } elseif ($endpoint === 'test' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $db = new Database();
        $connection = $db->connect();
        
        if ($connection) {
            $stmt = $connection->query("SELECT 1 as test");
            $result = $stmt->fetch();
            
            $response = [
                "status" => "success",
                "message" => "Conexión exitosa",
                "test_query" => $result['test'],
                "info" => $db->getConnectionInfo()
            ];
        } else {
            $response = [
                "status" => "error",
                "message" => "No se pudo conectar"
            ];
        }

    } else {
        $response = [
            "status" => "error", 
            "message" => "Endpoint no válido: '$endpoint', Método: " . $_SERVER['REQUEST_METHOD']
        ];
    }
} catch (Exception $e) {
    error_log("Exception in API: " . $e->getMessage());
    $response = [
        "status" => "error",
        "message" => "Excepción: " . $e->getMessage()
    ];
}

echo json_encode($response);
exit;
?>

