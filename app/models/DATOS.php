<?php
require_once "Database.php";
class Datos {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect(); 
    }
    
    
    public function obtenerTodas() {
        try {
            $sql = "SELECT * FROM DatosCuriosos ORDER BY iddato ASC";;
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("DEBUG obtenerTodas" . count($resultado) . " publicaciones");
            
            return $resultado;
            
        } catch (PDOException $e) {
            error_log("ERROR obtenerTodas: " . $e->getMessage());
            return [];
        }
    }
}
?>