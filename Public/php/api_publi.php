<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');


ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    require_once __DIR__ . '/../../App/models/Database.php';
    require_once __DIR__ . '/../../App/models/Publi.php';
    
    $metodo = $_SERVER['REQUEST_METHOD'];
    $endpoint = $_GET['endpoint'] ?? '';
    
    error_log("API_PUBLI: metodo=$metodo, endpoint=$endpoint");
    
    $publicacion = new Publicacion();
    
    if ($metodo === 'GET') {
        switch ($endpoint) {
            case 'todas':
                error_log("API_PUBLI: Procesando 'todas'");
                
                $limite = (int)($_GET['limite'] ?? 20);
                $offset = (int)($_GET['offset'] ?? 0);
                
                $publicaciones = $publicacion->obtenerTodas($limite, $offset);
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $publicaciones,
                    'total' => count($publicaciones),
                    'debug' => [
                        'limite' => $limite,
                        'offset' => $offset,
                        'endpoint' => 'todas'
                    ]
                ]);
                break;
                
            case 'usuario':
                error_log("API_PUBLI: Procesando 'usuario'");
                
                $correo = $_GET['correo'] ?? '';
                error_log("API_PUBLI: correo = '$correo'");
                
                if (empty($correo)) {
                    echo json_encode([
                        'status' => 'error', 
                        'message' => 'Correo de usuario requerido',
                        'debug' => [
                            'correo_recibido' => $correo
                        ]
                    ]);
                    exit;
                }
                          
                $publicaciones = $publicacion->obtenerPorUsuarioSimple($correo);
                error_log("API_PUBLI: obtenerPorUsuarioSimple devolvió " . count($publicaciones) . " para $correo");
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $publicaciones,
                    'total' => count($publicaciones),
                    'debug' => [
                        'correo' => $correo,
                        'metodo' => 'obtenerPorUsuarioSimple',
                        'endpoint' => 'usuario'
                    ]
                ]);
                break;
                
            case 'categorias':
                $categorias = $publicacion->obtenerCategorias();
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $categorias
                ]);
                break;
                
            case 'mundiales':
                $mundiales = $publicacion->obtenerMundiales();
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $mundiales
                ]);
                break;
                
            default:
                echo json_encode([
                    'status' => 'error', 
                    'message' => 'Endpoint no válido: ' . $endpoint,
                    'endpoints_disponibles' => ['todas', 'usuario', 'categorias', 'mundiales']
                ]);
        }
    } elseif ($metodo === 'POST') {
      
        switch ($endpoint) {
            case 'crear':             
                echo json_encode(['status' => 'info', 'message' => 'Función crear disponible aquí']);
                break;
                
            default:
                echo json_encode(['status' => 'error', 'message' => 'Endpoint POST no válido']);
        }
        
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Método no permitido: ' . $metodo]);
    }
    
} catch (Exception $e) {
    error_log("API_PUBLI ERROR: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
?>