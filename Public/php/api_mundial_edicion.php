<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../App/controllers/MundialController.php';

$mundialController = new MundialController();

if ($_GET['endpoint'] === 'mundiales' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $mundiales = $mundialController->obtenerTodos();
    echo json_encode(['status' => 'success', 'data' => $mundiales]);
    exit;
}

if ($_GET['endpoint'] === 'crear_mundial' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $pais = $input['paismundial'] ?? '';
    $sede = $input['sede'] ?? '';
    $year = $input['year'] ?? '';
    $imagen = $input['imagen_mundial'] ?? '';
    $resena = $input['resena_mundial'] ?? '';
    $ok = $mundialController->crear($pais, $sede, $year, $imagen, $resena);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}

if ($_GET['endpoint'] === 'editar_mundial' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $pais = $input['paismundial'] ?? '';
    $sede = $input['sede'] ?? '';
    $year = $input['year'] ?? '';
    $imagen = $input['imagen_mundial'] ?? '';
    $resena = $input['resena_mundial'] ?? '';
    $ok = $mundialController->editar($id, $pais, $sede, $year, $imagen, $resena);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}

if ($_GET['endpoint'] === 'eliminar_mundial' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $ok = $mundialController->eliminar($id);
    echo json_encode(['status' => $ok ? 'success' : 'error']);
    exit;
}
?>