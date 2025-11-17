<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../../App/controllers/CatCOntroller.php';
$catCOntroller = new CatCOntroller();

if ($_GET['endpoint'] === 'categorias' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $categorias = $catCOntroller->obtenerTodas();
    echo json_encode(['status' => 'success', 'data' => $categorias]);
    exit;
}

if ($_GET['endpoint'] === 'crear_categoria' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $nombre = $input['nombre'] ?? '';
    $ok = $catCOntroller->crear($nombre);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}

if ($_GET['endpoint'] === 'editar_categoria' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $nombre = $input['nombre'] ?? '';
    $ok = $catCOntroller->editar($id, $nombre);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}

if ($_GET['endpoint'] === 'eliminar_categoria' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $ok = $catCOntroller->eliminar($id);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}
?>