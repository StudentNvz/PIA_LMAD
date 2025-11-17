<?php
require_once __DIR__ . '/../models/Publi.php';

class PublicacionController {
    private $publicacionModel;

    public function __construct() {
        $this->publicacionModel = new Publicacion();
    }

    public function buscar($params) {
        $categoria = $params['categoria'] ?? null;
        $year = $params['year'] ?? null;
        $pais = $params['pais'] ?? null;
        $sede = $params['sede'] ?? null;
        $usuario = $params['usuario'] ?? null;
        $texto = $params['texto'] ?? null;

        return $this->publicacionModel->buscarPublicaciones($categoria, $year, $pais, $sede, $usuario, $texto);
    }
}
?>