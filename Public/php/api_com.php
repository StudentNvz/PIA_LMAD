<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

try {

    $host = "localhost";
    $port = 3307;
    $dbname = "futshito";
    $username = "root";
    $password = "";
    
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $metodo = $_SERVER['REQUEST_METHOD'];
    
    if ($metodo === 'GET') {

        $idPublicacion = $_GET['id_publicacion'] ?? null;
        
        if (!$idPublicacion) {
            echo json_encode([
                'status' => 'error',
                'message' => 'ID de publicación requerido'
            ]);
            exit;
        }

        $checkPub = $pdo->prepare("SELECT COUNT(*) as count FROM Publicaciones WHERE id_publicacion = ?");
        $checkPub->execute([$idPublicacion]);
        
        if ($checkPub->fetch()['count'] == 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Publicación no encontrada'
            ]);
            exit;
        }
        
        $sql = "SELECT 
                    c.id_comentario,
                    c.contenido,
                    c.fecha_comentario,
                    c.correo,
                    u.nombre_completo,
                    p.correo as autor_publicacion
                FROM Comentarios c
                INNER JOIN Usuarios u ON c.correo = u.correo
                INNER JOIN Publicaciones p ON c.id_publicacion = p.id_publicacion
                WHERE c.id_publicacion = ?
                ORDER BY c.fecha_comentario ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$idPublicacion]);
        $comentarios = $stmt->fetchAll();
        
        echo json_encode([
            'status' => 'success',
            'data' => $comentarios,
            'total' => count($comentarios),
            'id_publicacion' => $idPublicacion
        ]);
        
    } elseif ($metodo === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $idPublicacion = $input['id_publicacion'] ?? null;
        $contenido = trim($input['contenido'] ?? '');
        $correoUsuario = $input['correo'] ?? null;
        
        if (!$idPublicacion || !$contenido || !$correoUsuario) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Todos los campos son requeridos'
            ]);
            exit;
        }
        
        if (strlen($contenido) < 3) {
            echo json_encode([
                'status' => 'error',
                'message' => 'El comentario debe tener al menos 3 caracteres'
            ]);
            exit;
        }
        
        if (strlen($contenido) > 500) {
            echo json_encode([
                'status' => 'error',
                'message' => 'El comentario no puede exceder 500 caracteres'
            ]);
            exit;
        }
        
        $checkUser = $pdo->prepare("SELECT COUNT(*) as count FROM Usuarios WHERE correo = ?");
        $checkUser->execute([$correoUsuario]);
        
        if ($checkUser->fetch()['count'] == 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ]);
            exit;
        }
        
        $checkPub = $pdo->prepare("SELECT COUNT(*) as count FROM Publicaciones WHERE id_publicacion = ? AND aprovacion = 1");
        $checkPub->execute([$idPublicacion]);
        
        if ($checkPub->fetch()['count'] == 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Publicación no encontrada o no aprobada'
            ]);
            exit;
        }
        
        $sql = "INSERT INTO Comentarios (id_publicacion, correo, contenido, fecha_comentario) 
                VALUES (?, ?, ?, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $resultado = $stmt->execute([$idPublicacion, $correoUsuario, $contenido]);
        
        if ($resultado) {
            $idComentario = $pdo->lastInsertId();
            
            $getComment = $pdo->prepare("
                SELECT 
                    c.id_comentario,
                    c.contenido,
                    c.fecha_comentario,
                    c.correo,
                    u.nombre_completo,
                    p.correo as autor_publicacion
                FROM Comentarios c
                INNER JOIN Usuarios u ON c.correo = u.correo
                INNER JOIN Publicaciones p ON c.id_publicacion = p.id_publicacion
                WHERE c.id_comentario = ?
            ");
            $getComment->execute([$idComentario]);
            $nuevoComentario = $getComment->fetch();
            
            $updateCount = $pdo->prepare("UPDATE Publicaciones SET comentarios = comentarios + 1 WHERE id_publicacion = ?");
            $updateCount->execute([$idPublicacion]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Comentario agregado exitosamente',
                'data' => $nuevoComentario
            ]);
        } else {
            throw new Exception('Error al guardar el comentario');
        }
        
    } elseif ($metodo === 'DELETE') {
        // Eliminar comentario
        $input = json_decode(file_get_contents('php://input'), true);
        
        $idComentario = $input['id_comentario'] ?? null;
        $correoUsuario = $input['correo'] ?? null;
        
        if (!$idComentario || !$correoUsuario) {
            echo json_encode([
                'status' => 'error',
                'message' => 'ID de comentario y correo son requeridos'
            ]);
            exit;
        }
        
        $checkComment = $pdo->prepare("
            SELECT 
                c.correo as autor_comentario,
                c.id_publicacion,
                p.correo as autor_publicacion
            FROM Comentarios c
            INNER JOIN Publicaciones p ON c.id_publicacion = p.id_publicacion
            WHERE c.id_comentario = ?
        ");
        $checkComment->execute([$idComentario]);
        $comentarioInfo = $checkComment->fetch();
        
        if (!$comentarioInfo) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Comentario no encontrado'
            ]);
            exit;
        }
        
        if ($comentarioInfo['autor_comentario'] !== $correoUsuario && 
            $comentarioInfo['autor_publicacion'] !== $correoUsuario) {
            echo json_encode([
                'status' => 'error',
                'message' => 'No tienes permisos para eliminar este comentario'
            ]);
            exit;
        }

        $deleteStmt = $pdo->prepare("DELETE FROM Comentarios WHERE id_comentario = ?");
        $resultado = $deleteStmt->execute([$idComentario]);
        
        if ($resultado) {
            $updateCount = $pdo->prepare("UPDATE Publicaciones SET comentarios = GREATEST(0, comentarios - 1) WHERE id_publicacion = ?");
            $updateCount->execute([$comentarioInfo['id_publicacion']]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Comentario eliminado exitosamente',
                'id_comentario' => $idComentario
            ]);
        } else {
            throw new Exception('Error al eliminar el comentario');
        }
        
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Método no permitido'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>