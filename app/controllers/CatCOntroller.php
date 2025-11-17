<?php
require_once __DIR__ . '/../models/Cat.php';

class CatCOntroller {
    private $categoriaModel;

    public function __construct() {
        $this->categoriaModel = new Categoria();
    }

    public function obtenerTodas() {
        return $this->categoriaModel->obtenerTodas();
    }

    public function crear($nombre) {
        return $this->categoriaModel->crear($nombre);
    }

    public function editar($id, $nombre) {
        return $this->categoriaModel->editar($id, $nombre);
    }

    public function eliminar($id) {
        return $this->categoriaModel->eliminar($id);
    }
}
?>