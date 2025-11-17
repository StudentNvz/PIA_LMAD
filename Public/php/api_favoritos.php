<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    require_once __DIR__ . '/../../App/models/Database.php';
    
    $database = new Database();
    $db = $database->connect();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            echo json_encode(['status' => 'error', 'message' => 'No se recibieron datos JSON']);
            exit;
        }
        
        $action = $input['action'] ?? '';
        $correo = $input['correo'] ?? '';
        $idPublicacion = $input['id_publicacion'] ?? '';
        
        
        if (empty($correo) || empty($idPublicacion)) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos - correo o id_publicacion faltantes']);
            exit;
        }
        
        if ($action === 'add') {
            $check = $db->prepare("SELECT COUNT(*) FROM FavoritosPublicacion WHERE correo = ? AND id_publicacion = ?");
            $check->execute([$correo, $idPublicacion]);
            
            if ($check->fetchColumn() > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Ya está en favoritos']);
                exit;
            }
            
            $stmt = $db->prepare("INSERT INTO FavoritosPublicacion (correo, id_publicacion) VALUES (?, ?)");
            $resultado = $stmt->execute([$correo, $idPublicacion]);
            
            if ($resultado) {
                error_log("Favorito agregado exitosamente: correo=$correo, id=$idPublicacion");
                echo json_encode(['status' => 'success', 'message' => 'Agregado a favoritos']);
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("Error SQL al agregar favorito: " . print_r($errorInfo, true));
                echo json_encode(['status' => 'error', 'message' => 'Error al agregar favorito: ' . $errorInfo[2]]);
            }
            
        } elseif ($action === 'remove') {
            $stmt = $db->prepare("DELETE FROM FavoritosPublicacion WHERE correo = ? AND id_publicacion = ?");
            $resultado = $stmt->execute([$correo, $idPublicacion]);
            
            if ($resultado && $stmt->rowCount() > 0) {
                error_log("Favorito eliminado exitosamente: correo=$correo, id=$idPublicacion");
                echo json_encode(['status' => 'success', 'message' => 'Eliminado de favoritos']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se encontró el favorito para eliminar']);
            }
            
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Acción no válida: ' . $action]);
        }
        
    } elseif ($method === 'GET' && $action === 'getUserFavorites') {
        $correo = $_GET['correo'] ?? '';
        
        if (empty($correo)) {
            echo json_encode(['status' => 'error', 'message' => 'Correo requerido']);
            exit;
        }
        
        $stmt = $db->prepare("SELECT id_publicacion FROM FavoritosPublicacion WHERE correo = ?");
        $stmt->execute([$correo]);
        $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("Favoritos encontrados para $correo: " . count($favoritos));
        echo json_encode(['status' => 'success', 'data' => $favoritos]);
        
    } elseif ($method === 'GET' && $action === 'getFavoritesPosts') {
        $correo = $_GET['correo'] ?? '';
        
        if (empty($correo)) {
            echo json_encode(['status' => 'error', 'message' => 'Correo requerido']);
            exit;
        }
        
        $sql = "SELECT p.*, f.fecha_guardado as fecha_favorito 
                FROM Publicaciones p 
                INNER JOIN FavoritosPublicacion f ON p.id_publicacion = f.id_publicacion 
                WHERE f.correo = ? 
                ORDER BY f.fecha_guardado DESC";
        
        error_log("SQL a ejecutar: $sql");
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$correo]);
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("Publicaciones favoritas encontradas para $correo: " . count($publicaciones));
        error_log("Primera publicación favorita: " . print_r($publicaciones[0] ?? 'ninguna', true));
        
        echo json_encode([
            'status' => 'success', 
            'data' => $publicaciones, 
            'total' => count($publicaciones),
            'debug' => [
                'correo_buscado' => $correo,
                'sql_usado' => $sql,
                'resultados' => count($publicaciones)
            ]
        ]);
        
    } else {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Endpoint no válido',
            'method' => $method,
            'action' => $action,
            'available_actions' => ['add', 'remove', 'getUserFavorites', 'getFavoritesPosts']
        ]);
    }
    
} catch (Exception $e) {
    error_log("API Favoritos ERROR: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error interno del servidor: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>