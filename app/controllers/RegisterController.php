<?php
require_once __DIR__."/../models/Usuario.php";

class RegisterController {
    public function register($post, $files) {
        $usuario = new Usuario();


        $fotoBinario = null;
        if (!empty($files['foto']['tmp_name'])) {

            if ($files['foto']['size'] > 16 * 1024 * 1024) {
                throw new Exception("La imagen es demasiado grande. Máximo 16MB permitido.");
            }

            $imageInfo = getimagesize($files['foto']['tmp_name']);
            if ($imageInfo === false) {
                throw new Exception("El archivo no es una imagen válida.");
            }

            $fotoBinario = $this->redimensionarImagen($files['foto']['tmp_name'], $imageInfo);
        }

        $data = [
            'nombre' => $post['nombreCompleto'],
            'fecha' => $post['fechaNacimiento'],
            'foto' => $fotoBinario,
            'genero' => $post['genero'],
            'pais' => $post['paisNacimiento'],
            'nacionalidad' => $post['nacionalidad'],
            'correo' => $post['email'],
            'password' => $post['password']
        ];

        return $usuario->registrar($data);
    }

    private function redimensionarImagen($rutaTemporal, $imageInfo) {
        $maxWidth = 300;  
        $maxHeight = 300; 
        $quality = 80;    

        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];
        $mimeType = $imageInfo['mime'];

        if ($originalWidth <= $maxWidth && $originalHeight <= $maxHeight) {
            return file_get_contents($rutaTemporal);
        }

        $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);
        $newWidth = (int)($originalWidth * $ratio);
        $newHeight = (int)($originalHeight * $ratio);

        switch ($mimeType) {
            case 'image/jpeg':
                $sourceImage = imagecreatefromjpeg($rutaTemporal);
                break;
            case 'image/png':
                $sourceImage = imagecreatefrompng($rutaTemporal);
                break;
            case 'image/gif':
                $sourceImage = imagecreatefromgif($rutaTemporal);
                break;
            default:
                throw new Exception("Formato de imagen no soportado. Use JPEG, PNG o GIF.");
        }

        $newImage = imagecreatetruecolor($newWidth, $newHeight);

        if ($mimeType == 'image/png') {
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);
            $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
            imagefill($newImage, 0, 0, $transparent);
        }
        imagecopyresampled(
            $newImage, $sourceImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );

        ob_start();
        imagejpeg($newImage, null, $quality);
        $imageBinary = ob_get_contents();
        ob_end_clean();

        imagedestroy($sourceImage);
        imagedestroy($newImage);

        return $imageBinary;
    }
}
