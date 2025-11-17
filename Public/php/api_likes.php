<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if(session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

try {
    require_once __DIR__ . '/../../App/models/Database.php';
    
    $database = new Database();
    $db = $database->connect();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        $correo = $input['correo'] ?? '';
        $idPublicacion = $input['id_publicacion'] ?? '';
        
        if (empty($correo) || empty($idPublicacion)) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
            exit;
        }
        
        if ($action === 'add') {

            $check = $db->prepare("SELECT COUNT(*) FROM LikesPublicacion WHERE correo = ? AND id_publicacion = ?");
            $check->execute([$correo, $idPublicacion]);
            
            if ($check->fetchColumn() > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Ya tienes like en esta publicación']);
                exit;
            }
   
            $stmt = $db->prepare("INSERT INTO LikesPublicacion (correo, id_publicacion) VALUES (?, ?)");
            $stmt->execute([$correo, $idPublicacion]);
            

            $update = $db->prepare("UPDATE Publicaciones SET likes = COALESCE(likes, 0) + 1 WHERE id_publicacion = ?");
            $update->execute([$idPublicacion]);
            
            echo json_encode(['status' => 'success', 'message' => 'Like agregado']);
            
        } elseif ($action === 'remove') {

            $stmt = $db->prepare("DELETE FROM LikesPublicacion WHERE correo = ? AND id_publicacion = ?");
            $stmt->execute([$correo, $idPublicacion]);
            
            $update = $db->prepare("UPDATE Publicaciones SET likes = GREATEST(COALESCE(likes, 1) - 1, 0) WHERE id_publicacion = ?");
            $update->execute([$idPublicacion]);
            
            echo json_encode(['status' => 'success', 'message' => 'Like eliminado']);
        }
        
    } elseif ($method === 'GET' && $action === 'getUserLikes') {
        $correo = $_GET['correo'] ?? '';
        
        if (empty($correo)) {
            echo json_encode(['status' => 'error', 'message' => 'Correo requerido']);
            exit;
        }
        
        $stmt = $db->prepare("SELECT id_publicacion FROM LikesPublicacion WHERE correo = ?");
        $stmt->execute([$correo]);
        $likes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $likes]);
    }
    
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>