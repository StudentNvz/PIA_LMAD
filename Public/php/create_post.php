<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido. Solo POST'
    ]);
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
    

    $titulo = $_POST['title'] ?? '';
    $contenido = $_POST['content'] ?? '';
    $categoriaId = $_POST['category'] ?? '';
    $mundialId = $_POST['worldcup'] ?? '';
    $pais = $_POST['country'] ?? 'No especificado';
    $email = $_POST['email'] ?? '';
    $autor = $_POST['author'] ?? '';

    $categoria = is_numeric($categoriaId) ? intval($categoriaId) : null;
$mundial = is_numeric($mundialId) ? intval($mundialId) : null;

    if (empty($titulo) || empty($contenido) || empty($categoria) || empty($mundial) || empty($email)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Todos los campos obligatorios deben ser completados'
        ]);
        exit();
    }
    

    $stmt = $pdo->prepare("SELECT correo FROM Usuarios WHERE correo = ?");
    $stmt->execute([$email]);
    if (!$stmt->fetch()) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Usuario no encontrado en el sistema'
        ]);
        exit();
    }
    

    $mediaBlob = null;
    if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['media'];
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileType = $file['type'];
        

        $allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/avi', 'video/mov'
        ];
        
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Tipo de archivo no permitido. Solo JPG, PNG, GIF, MP4, AVI, MOV'
            ]);
            exit();
        }
        
        $minSize = 50 * 1024; // 50KB 
        $maxSize = 16 * 1024 * 1024; // 16MB

        if ($fileSize < $minSize) {
            echo json_encode([
                'status' => 'error',
                'message' => 'El archivo es demasiado pequeño. Mínimo 50KB para asegurar calidad',
                'file_size_kb' => round($fileSize / 1024, 2)
            ]);
            exit();
        }

        if ($fileSize > $maxSize) {
            echo json_encode([
                'status' => 'error',
                'message' => 'El archivo es demasiado grande. Máximo 3MB',
                'file_size_mb' => round($fileSize / 1024 / 1024, 2),
                'max_size_mb' => round($maxSize / 1024 / 1024, 2)
            ]);
            exit();
        }
        

        if (strpos($fileType, 'image/') === 0) {

            $imagenOptimizada = optimizarImagenParaBlob($fileTmpName, $fileType, $fileSize);
            if ($imagenOptimizada) {
                $mediaBlob = $imagenOptimizada;
                error_log("Imagen BLOB: " . strlen($mediaBlob) . " bytes");
            } else {
            
                $mediaBlob = file_get_contents($fileTmpName);
            }
        } else {

            $mediaBlob = file_get_contents($fileTmpName);
        }
        
        if (!$mediaBlob || strlen($mediaBlob) < $minSize) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al procesar el archivo. Datos insuficientes.',
                'debug' => [
                    'file_size_original' => $fileSize,
                    'blob_size' => strlen($mediaBlob ?: ''),
                    'file_path' => $fileTmpName
                ]
            ]);
            exit();
        }
        
        error_log("Listo: Original {$fileSize} bytes → BLOB " . strlen($mediaBlob) . " bytes");
    }
    
    $categoriaId = $categoria;
    $mundialId = $mundial;
    
    $sql = "INSERT INTO Publicaciones 
            (titulo, contenido, correo, media, aprovacion, likes, comentarios, 
             fechahora_publicacion, pais_publicacion, fk_Categoria, fk_Mundial) 
            VALUES (?, ?, ?, ?, 0, 0, 0, NOW(), ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $resultado = $stmt->execute([
        $titulo,
        $contenido,
        $email,
        $mediaBlob,  
        $pais,
        $categoriaId,
        $mundialId
    ]);
    
    if ($resultado) {
        $idPublicacion = $pdo->lastInsertId();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Publicación creada exitosamente',
            'data' => [
                'id_publicacion' => $idPublicacion,
                'titulo' => $titulo,
                'correo' => $email,
                'media_size_bytes' => strlen($mediaBlob),
                'media_size_kb' => round(strlen($mediaBlob) / 1024, 2),
                'estado' => 'Pendiente de aprobación'
            ]
        ]);
    } else {
        throw new Exception('Error al insertar en la base de datos');
    }
    
} catch (PDOException $e) {
    error_log("Error de BD en create_post.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'debug_info' => [
            'host' => $host ?? 'undefined',
            'port' => $port ?? 'undefined',
            'database' => $dbname ?? 'undefined'
        ]
    ]);
} catch (Exception $e) {
    error_log("Error general en create_post.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}


function optimizarImagenParaBlob($archivoTemporal, $tipoMime, $tamanoOriginal) {
    try {
   
        $imagen = null;
        switch ($tipoMime) {
            case 'image/jpeg':
            case 'image/jpg':
                $imagen = imagecreatefromjpeg($archivoTemporal);
                break;
            case 'image/png':
                $imagen = imagecreatefrompng($archivoTemporal);
                break;
            case 'image/gif':
                $imagen = imagecreatefromgif($archivoTemporal);
                break;
            default:
                return false;
        }
        
        if (!$imagen) return false;
        
     
        $anchoOriginal = imagesx($imagen);
        $altoOriginal = imagesy($imagen);
        
       
        $maxAncho = 1200;
        $maxAlto = 900;
        
        $ratio = min($maxAncho / $anchoOriginal, $maxAlto / $altoOriginal, 1);
        
        $nuevoAncho = (int)($anchoOriginal * $ratio);
        $nuevoAlto = (int)($altoOriginal * $ratio);
        
        
        $imagenOptimizada = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
        
     
        if ($tipoMime === 'image/png') {
            imagealphablending($imagenOptimizada, false);
            imagesavealpha($imagenOptimizada, true);
            $transparent = imagecolorallocatealpha($imagenOptimizada, 255, 255, 255, 127);
            imagefill($imagenOptimizada, 0, 0, $transparent);
        }
        
       
        imagecopyresampled($imagenOptimizada, $imagen, 0, 0, 0, 0, 
                         $nuevoAncho, $nuevoAlto, $anchoOriginal, $altoOriginal);
        
        
        ob_start();
        $calidad = ($tamanoOriginal > 1024 * 1024) ? 75 : 85; 
        
        switch ($tipoMime) {
            case 'image/jpeg':
            case 'image/jpg':
                imagejpeg($imagenOptimizada, null, $calidad);
                break;
            case 'image/png':
                imagepng($imagenOptimizada, null, 6); 
                break;
            case 'image/gif':
                imagegif($imagenOptimizada, null);
                break;
        }
        
        $blobData = ob_get_clean();
        
        imagedestroy($imagen);
        imagedestroy($imagenOptimizada);
        
        return $blobData;
        
    } catch (Exception $e) {
        error_log("Error optimizando imagen para BLOB: " . $e->getMessage());
        return false;
    }
}
?>