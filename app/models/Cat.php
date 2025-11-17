<?php
require_once "Database.php";

class Categoria {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function obtenerTodas() {
        $sql = "SELECT * FROM Categorias ORDER BY nombrecategoria";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear($nombre) {
        $sql = "INSERT INTO Categorias (nombrecategoria) VALUES (?)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$nombre]);
    }

    public function editar($id, $nombre) {
        $sql = "UPDATE Categorias SET nombrecategoria = ? WHERE idcat = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$nombre, $id]);
    }

    public function eliminar($id) {
        $sql = "DELETE FROM Categorias WHERE idcat = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>