<?php
require_once __DIR__ . '/../models/Mundial2.php';

class MundialController {
    private $mundialModel;

    public function __construct() {
        $this->mundialModel = new Mundial();
    }

    public function obtenerTodos() {
        return $this->mundialModel->obtenerTodos();
    }

    public function crear($pais, $sede, $year, $imagen, $resena) {
        return $this->mundialModel->crear($pais, $sede, $year, $imagen, $resena);
    }

    public function editar($id, $pais, $sede, $year, $imagen, $resena) {
        return $this->mundialModel->editar($id, $pais, $sede, $year, $imagen, $resena);
    }

    public function eliminar($id) {
        return $this->mundialModel->eliminar($id);
    }
}
?>