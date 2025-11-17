<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    

    $endpoint = $_GET['endpoint'] ?? '';
    $correo = $_GET['correo'] ?? '';
    
    if ($endpoint === 'get_user') {
        if (empty($correo)) {
            echo json_encode(['status' => 'error', 'message' => 'Correo requerido']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT nombre_completo, fecha_nacimiento, foto, genero, pais_nacimiento, nacionalidad, correo, contrasena FROM Usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado']);
            exit;
        }
        $user['foto_url'] = $user['foto'] ? ('data:image/jpeg;base64,' . base64_encode($user['foto'])) : 'Imagenes/default-user.png';
        unset($user['foto']);

        echo json_encode(['status' => 'success', 'data' => $user]);
        exit;
    }

    if ($endpoint === 'update_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $correo_actual = $input['correo_actual'] ?? '';
        $nombre = $input['nombre'] ?? '';
        $fecha = $input['fecha'] ?? '';
        $genero = $input['genero'] ?? '';
        $pais = $input['pais'] ?? '';
        $nacionalidad = $input['nacionalidad'] ?? '';
        $correo_nuevo = $input['correo_nuevo'] ?? '';
        $password = $input['password'] ?? '';
        $foto_base64 = $input['foto_base64'] ?? '';

        if (!$correo_actual || !$nombre || !$fecha || !$correo_nuevo) {
            echo json_encode(['status' => 'error', 'message' => 'Faltan campos requeridos']);
            exit;
        }
        $foto_blob = null;
        if ($foto_base64 && strpos($foto_base64, 'base64,') !== false) {
            $foto_blob = base64_decode(explode('base64,', $foto_base64)[1]);
        }

        $sql = "UPDATE Usuarios SET 
                    nombre_completo = :nombre,
                    fecha_nacimiento = :fecha,
                    genero = :genero,
                    pais_nacimiento = :pais,
                    nacionalidad = :nacionalidad,
                    correo = :correo_nuevo" .
                    ($password ? ", contrasena = :password" : "") .
                    ($foto_blob ? ", foto = :foto" : "") .
                " WHERE correo = :correo_actual";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':fecha', $fecha);
        $stmt->bindParam(':genero', $genero);
        $stmt->bindParam(':pais', $pais);
        $stmt->bindParam(':nacionalidad', $nacionalidad);
        $stmt->bindParam(':correo_nuevo', $correo_nuevo);
        $stmt->bindParam(':correo_actual', $correo_actual);
        if ($password) $stmt->bindParam(':password', $password);
        if ($foto_blob) $stmt->bindParam(':foto', $foto_blob, PDO::PARAM_LOB);

        $stmt->execute();

        echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado']);
        exit;
    }
    
    if ($endpoint === 'test') {
        echo json_encode([
            'status' => 'success',
            'message' => 'API funcionando correctamente',
            'timestamp' => date('Y-m-d H:i:s'),
            'database_connected' => true
        ]);
        exit;
    }
    
    if ($endpoint === 'usuario') {
        if (empty($correo)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Parámetro correo es requerido'
            ]);
            exit;
        }
        

        $checkUser = $pdo->prepare("SELECT COUNT(*) as count FROM Usuarios WHERE correo = ?");
        $checkUser->execute([$correo]);
        $userExists = $checkUser->fetch()['count'] > 0;
        
        if (!$userExists) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Usuario no encontrado',
                'correo' => $correo
            ]);
            exit;
        }
        

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
                WHERE correo = ? 
                ORDER BY fechahora_publicacion DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$correo]);
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($publicaciones as &$pub) {
            $pub['tiene_imagen_blob'] = ($pub['media_info'] === 'tiene_blob');
            $pub['tamaño_imagen_kb'] = $pub['media_size'] ? round($pub['media_size'] / 1024, 2) : 0;
            
            if ($pub['tiene_imagen_blob']) {
                $pub['imagen_blob_url'] = "Public/php/show_image_blob.php?id=" . $pub['id_publicacion'];
            }
        }
        
        echo json_encode([
            'status' => 'success',
            'data' => $publicaciones,
            'total' => count($publicaciones),
            'correo' => $correo,
            'user_exists' => $userExists
        ]);
        exit;
    }
    
    if ($endpoint === 'favoritos') {
        if (empty($correo)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Parámetro correo es requerido para favoritos'
            ]);
            exit;
        }
        
        $sql = "SELECT 
                    p.id_publicacion,
                    p.titulo,
                    p.contenido,
                    p.fechahora_publicacion,
                    p.aprovacion,
                    p.likes,
                    p.comentarios,
                    p.pais_publicacion,
                    p.correo,
                    p.fk_Categoria,
                    p.fk_Mundial,
                    f.fecha_guardado as fecha_favorito,
                    CASE 
                        WHEN p.media IS NOT NULL AND LENGTH(p.media) > 0 THEN 'tiene_blob'
                        ELSE 'sin_imagen' 
                    END as media_info,
                    LENGTH(p.media) as media_size
                FROM Publicaciones p
                INNER JOIN FavoritosPublicacion f ON p.id_publicacion = f.id_publicacion
                WHERE f.correo = ? 
                ORDER BY f.fecha_guardado DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$correo]);
        $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
 
        foreach ($favoritos as &$fav) {
            $fav['tiene_imagen_blob'] = ($fav['media_info'] === 'tiene_blob');
            $fav['tamaño_imagen_kb'] = $fav['media_size'] ? round($fav['media_size'] / 1024, 2) : 0;
            

            if ($fav['tiene_imagen_blob']) {
                $fav['imagen_blob_url'] = "Public/php/show_image_blob.php?id=" . $fav['id_publicacion'];
            }
        }
        
        echo json_encode([
            'status' => 'success',
            'data' => $favoritos,
            'total' => count($favoritos),
            'correo' => $correo,
            'tipo' => 'favoritos'
        ]);
        exit;
    }
    
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint no válido',
        'endpoint_recibido' => $endpoint,
        'endpoints_disponibles' => ['test', 'usuario', 'favoritos']
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'connection_info' => [
            'host' => $host ?? 'undefined',
            'port' => $port ?? 'undefined', 
            'database' => $dbname ?? 'undefined'
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