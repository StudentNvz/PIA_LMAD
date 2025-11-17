<?php

header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 0);
error_reporting(0);

try {
    $id = $_GET['id'] ?? 0;
    
    if (!$id || !is_numeric($id)) {
        mostrarImagenPlaceholder('Sin ID');
        exit;
    }
    
    $host = "localhost";
    $port = 3307;
    $dbname = "futshito";
    $username = "root";
    $password = "";
    
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", 
                  $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    

    $stmt = $pdo->prepare("SELECT media, LENGTH(media) as tamano FROM Publicaciones WHERE id_publicacion = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch();
    
    if (!$result || !$result['media']) {
        mostrarImagenPlaceholder('Sin imagen en BD');
        exit;
    }

    $imageData = $result['media'];
    $tamano = $result['tamano'];
    

    if ($tamano < 1024) {
        mostrarImagenPlaceholder("Imagen muy pequeña: {$tamano} bytes");
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($imageData);
    
    if (!$mimeType || strpos($mimeType, 'image/') !== 0) {
        mostrarImagenPlaceholder("Tipo no válido: " . ($mimeType ?: 'desconocido'));
        exit;
    }
    
  
    $tempFile = tempnam(sys_get_temp_dir(), 'img_check');
    file_put_contents($tempFile, $imageData);
    
    $imageInfo = @getimagesize($tempFile);
    unlink($tempFile);
    
    if (!$imageInfo) {
        mostrarImagenPlaceholder('Imagen corrupta');
        exit;
    }
    

    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . strlen($imageData));
    header('Cache-Control: public, max-age=3600'); 
    echo $imageData;
    
} catch (Exception $e) {
    mostrarImagenPlaceholder("Error: " . $e->getMessage());
}

function mostrarImagenPlaceholder($mensaje = 'Error') {
  
    $width = 400;
    $height = 300;
    $image = imagecreate($width, $height);
    

    $bgColor = imagecolorallocate($image, 248, 215, 218); 
    $textColor = imagecolorallocate($image, 114, 28, 36); 
    $borderColor = imagecolorallocate($image, 220, 53, 69); 
    

    imagefill($image, 0, 0, $bgColor);
    
  
    imagerectangle($image, 0, 0, $width-1, $height-1, $borderColor);
    imagerectangle($image, 1, 1, $width-2, $height-2, $borderColor);
    

    $lines = explode('\n', wordwrap($mensaje, 25, '\n'));
    $lineHeight = 20;
    $totalHeight = count($lines) * $lineHeight;
    $startY = ($height - $totalHeight) / 2;
    
    foreach ($lines as $i => $line) {
        $textWidth = strlen($line) * 10; 
        $x = ($width - $textWidth) / 2;
        $y = $startY + ($i * $lineHeight);
        imagestring($image, 4, $x, $y, $line, $textColor);
    }
    
    imagestring($image, 5, $width/2 - 10, 50, "Mal", $textColor);
    
    header('Content-Type: image/jpeg');
    imagejpeg($image, null, 85);
    imagedestroy($image);
}
?>