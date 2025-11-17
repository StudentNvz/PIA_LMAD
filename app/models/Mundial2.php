<?php
require_once "Database.php";

class Mundial {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function obtenerTodos() {
        $sql = "SELECT * FROM Mundial ORDER BY Year_Mundial DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear($pais, $sede, $year, $imagen, $resena) {
        $sql = "INSERT INTO Mundial (paismundial, Sede, Year_Mundial, imagen_mundial, resena_mundial, likes, comentarios) VALUES (?, ?, ?, ?, ?, 0, 0)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$pais, $sede, $year, $imagen, $resena]);
    }

    public function editar($id, $pais, $sede, $year, $imagen, $resena) {
        $sql = "UPDATE Mundial SET paismundial=?, Sede=?, Year_Mundial=?, imagen_mundial=?, resena_mundial=? WHERE IDMundial=?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$pais, $sede, $year, $imagen, $resena, $id]);
    }

    public function eliminar($id) {
        $sql = "DELETE FROM Mundial WHERE IDMundial=?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>