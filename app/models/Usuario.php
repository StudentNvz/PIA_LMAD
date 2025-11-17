<?php
require_once "Database.php";

class Usuario {
    private $conn;
    private $tabla = 'usuarios';
    
    public function __construct() {
        $db = new Database();
        $this->conn = $db->connect();
    }

    public function registrar($data) {
        try {
            $sql = "INSERT INTO usuarios 
                (nombre_completo, fecha_nacimiento, foto, genero, pais_nacimiento, nacionalidad, correo, contrasena, rol) 
                VALUES (:nombre, :fecha, :foto, :genero, :pais, :nac, :correo, :pass, :rol)";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":nombre", $data['nombre']);
            $stmt->bindParam(":fecha", $data['fecha']);
            $stmt->bindParam(":foto", $data['foto'], PDO::PARAM_LOB);
            $stmt->bindParam(":genero", $data['genero']);
            $stmt->bindParam(":pais", $data['pais']);
            $stmt->bindParam(":nac", $data['nacionalidad']);
            $stmt->bindParam(":correo", $data['correo']);
            $stmt->bindValue(":pass", $data['password']);
            
            $stmt->bindValue(":rol", "usuario");
            
            $resultado = $stmt->execute();
            
            if ($resultado) {
                return $this->conn->lastInsertId(); 
            }
            
            return false;
            
        } catch (PDOException $e) {
            error_log("Error en registrar(): " . $e->getMessage());
            
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                throw new Exception("Ya existe un usuario con ese correo electrónico.");
            }
            
            if (strpos($e->getMessage(), 'max_allowed_packet') !== false) {
                throw new Exception("La imagen es demasiado grande. Por favor, sube una imagen más pequeña (máximo 1MB).");
            }
            
            throw new Exception("Error al guardar en la base de datos: " . $e->getMessage());
        }
    }

    public function getByEmail($email) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM {$this->tabla} WHERE correo = :correo LIMIT 1");
            $stmt->bindParam(':correo', $email);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en getByEmail(): " . $e->getMessage());
            return false;
        }
    }

    public function verificarPassword($email, $password) {
        try {
            $usuario = $this->getByEmail($email);
            
            if (!$usuario) {
                return false;
            }
            if ($password === $usuario['contrasena']) {
                return $usuario;
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Error en verificarPassword(): " . $e->getMessage());
            return false;
        }
    }
}
?>
