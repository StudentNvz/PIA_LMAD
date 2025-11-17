<?php
// filepath: d:\xampp\htdocs\Capa - copia2\mostrar_imagen.php

// Activar errores para debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("ID de usuario no válido");
    }
    
    $userId = (int)$_GET['id'];
    
    // Conectar a BD
    require_once __DIR__ . "/App/models/Database.php";
    
    $db = new Database();
    $conn = $db->connect();
    
    // Obtener imagen del usuario
    $stmt = $conn->prepare("SELECT foto, nombre_completo FROM usuarios WHERE id_usuario = ? AND foto IS NOT NULL");
    $stmt->execute([$userId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario || empty($usuario['foto'])) {
        // Mostrar imagen por defecto
        header('Content-Type: image/png');
        
        // Crear imagen por defecto simple
        $img = imagecreate(200, 200);
        $bg = imagecolorallocate($img, 240, 240, 240);
        $textColor = imagecolorallocate($img, 100, 100, 100);
        
        imagestring($img, 5, 60, 90, 'Sin foto', $textColor);
        
        imagepng($img);
        imagedestroy($img);
        exit;
    }
    
    // Detectar tipo de imagen
    $imageData = $usuario['foto'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($imageData);
    
    // Validar que sea una imagen
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception("Tipo de archivo no válido: $mimeType");
    }
    
    // Headers para mostrar la imagen
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . strlen($imageData));
    
    // Si es descarga
    if (isset($_GET['download'])) {
        $extension = explode('/', $mimeType)[1];
        $nombreArchivo = preg_replace('/[^a-zA-Z0-9_-]/', '_', $usuario['nombre_completo']);
        header('Content-Disposition: attachment; filename="' . $nombreArchivo . '_foto.' . $extension . '"');
    } else {
        header('Content-Disposition: inline');
    }
    
    // Enviar la imagen
    echo $imageData;
    
} catch (Exception $e) {
    // En caso de error, mostrar imagen de error
    header('Content-Type: image/png');
    
    $img = imagecreate(200, 200);
    $bg = imagecolorallocate($img, 255, 200, 200);
    $textColor = imagecolorallocate($img, 200, 0, 0);
    
    imagestring($img, 3, 50, 90, 'ERROR:', $textColor);
    imagestring($img, 2, 30, 110, substr($e->getMessage(), 0, 25), $textColor);
    
    imagepng($img);
    imagedestroy($img);
}
?>