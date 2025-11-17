<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../App/models/Database.php';
$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $correo = $input['correo'] ?? '';
    $idMundial = $input['id_mundial'] ?? '';

    if (empty($correo) || empty($idMundial)) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
        exit;
    }

    if ($action === 'add') {
        $check = $db->prepare("SELECT COUNT(*) FROM LikesMundial WHERE correo = ? AND IDMundial = ?");
        $check->execute([$correo, $idMundial]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Ya tienes like en este mundial']);
            exit;
        }
        $stmt = $db->prepare("INSERT INTO LikesMundial (correo, IDMundial) VALUES (?, ?)");
        $stmt->execute([$correo, $idMundial]);
        $update = $db->prepare("UPDATE Mundial SET likes = COALESCE(likes, 0) + 1 WHERE IDMundial = ?");
        $update->execute([$idMundial]);
        echo json_encode(['status' => 'success', 'message' => 'Like agregado']);
    } elseif ($action === 'remove') {
        $stmt = $db->prepare("DELETE FROM LikesMundial WHERE correo = ? AND IDMundial = ?");
        $stmt->execute([$correo, $idMundial]);
        $update = $db->prepare("UPDATE Mundial SET likes = GREATEST(COALESCE(likes, 1) - 1, 0) WHERE IDMundial = ?");
        $update->execute([$idMundial]);
        echo json_encode(['status' => 'success', 'message' => 'Like eliminado']);
    }
}
?>