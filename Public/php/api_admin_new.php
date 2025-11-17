<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
    $endpoint = $_GET['endpoint'] ?? '';
    
    if ($metodo === 'GET') {
        
        if ($endpoint === 'test') {
            $stmt = $pdo->query("SELECT COUNT(*) as pendientes FROM Publicaciones WHERE aprovacion = 0 OR aprovacion IS NULL");
            $count = $stmt->fetch();
            
            echo json_encode([
                'status' => 'success',
                'message' => 'API Admin funcionando correctamente',
                'timestamp' => date('Y-m-d H:i:s'),
                'publicaciones_pendientes' => (int)$count['pendientes']
            ]);
            exit;
        }
        
        if ($endpoint === 'pendientes') {
            $limite = (int)($_GET['limite'] ?? 50);
            $sql = "SELECT 
                        id_publicacion,
                        titulo,
                        contenido,
                        fechahora_publicacion,
                        aprovacion,
                        likes,
                        comentarios,
                        pais_publicacion,
                        correo,
                        fk_Categoria,
                        fk_Mundial,
                        CASE 
                            WHEN media IS NOT NULL AND LENGTH(media) > 0 THEN 'tiene_blob'
                            ELSE 'sin_imagen' 
                        END as media_info,
                        LENGTH(media) as media_size
                    FROM Publicaciones 
                    WHERE aprovacion = 0 OR aprovacion IS NULL
                    ORDER BY fechahora_publicacion DESC
                    LIMIT :limite";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
            $stmt->execute();
            $publicaciones = $stmt->fetchAll();
            
            foreach ($publicaciones as &$pub) {
                $pub['tiene_imagen_blob'] = ($pub['media_info'] === 'tiene_blob');
                $pub['tamaño_imagen_kb'] = $pub['media_size'] ? round($pub['media_size'] / 1024, 2) : 0;
            }
            
            error_log("API Admin: SQL ejecutado - " . $sql);
            error_log("API Admin: Encontradas " . count($publicaciones) . " publicaciones pendientes");
            
            echo json_encode([
                'status' => 'success',
                'data' => $publicaciones,
                'total' => count($publicaciones),
                'endpoint' => 'pendientes',
                'debug' => [
                    'limite_aplicado' => $limite,
                    'sql_ejecutado' => $sql
                ]
            ]);
            exit;
        }
        
    } elseif ($metodo === 'POST') {
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($endpoint === 'aprobar') {
            $idPublicacion = $input['id_publicacion'] ?? null;
            
            if (!$idPublicacion) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de publicación es requerido'
                ]);
                exit;
            }
            
            $sql = "UPDATE Publicaciones SET aprovacion = 1 WHERE id_publicacion = ?";
            $stmt = $pdo->prepare($sql);
            $resultado = $stmt->execute([$idPublicacion]);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Publicación aprobada exitosamente',
                    'id_publicacion' => $idPublicacion
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al aprobar la publicación'
                ]);
            }
            exit;
        }
        
        if ($endpoint === 'rechazar') {
            $idPublicacion = $input['id_publicacion'] ?? null;
            
            if (!$idPublicacion) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de publicación es requerido'
                ]);
                exit;
            }
            
            $sql = "DELETE FROM Publicaciones WHERE id_publicacion = ?";
            $stmt = $pdo->prepare($sql);
            $resultado = $stmt->execute([$idPublicacion]);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Publicación rechazada y eliminada',
                    'id_publicacion' => $idPublicacion
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al rechazar la publicación'
                ]);
            }
            exit;
        }
    }
    
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint o método no válido',
        'metodo' => $metodo,
        'endpoint' => $endpoint,
        'endpoints_disponibles' => [
            'GET' => ['test', 'pendientes'],
            'POST' => ['aprobar', 'rechazar']
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'debug_info' => [
            'host' => $host,
            'port' => $port,
            'database' => $dbname,
            'sql_state' => $e->getCode()
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
?>