<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../App/models/Database.php';
$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $idMundial = $_GET['id_mundial'] ?? null;
    if (!$idMundial) {
        echo json_encode(['status' => 'error', 'message' => 'ID de mundial requerido']);
        exit;
    }
    $sql = "SELECT c.id_comentario, c.contenido, c.fecha_comentario, c.correo, u.nombre_completo
            FROM ComentariosMundial c
            INNER JOIN Usuarios u ON c.correo = u.correo
            WHERE c.IDMundial = ?
            ORDER BY c.fecha_comentario ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute([$idMundial]);
    $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $comentarios, 'total' => count($comentarios)]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $idMundial = $input['id_mundial'] ?? null;
    $contenido = trim($input['contenido'] ?? '');
    $correoUsuario = $input['correo'] ?? null;
    if (!$idMundial || !$contenido || !$correoUsuario) {
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son requeridos']);
        exit;
    }
    if (strlen($contenido) < 1) {
        echo json_encode(['status' => 'error', 'message' => 'El comentario debe tener al menos 1 carácter']);
        exit;
    }
    if (strlen($contenido) > 500) {
        echo json_encode(['status' => 'error', 'message' => 'El comentario no puede exceder 500 caracteres']);
        exit;
    }
    $stmt = $db->prepare("INSERT INTO ComentariosMundial (IDMundial, correo, contenido) VALUES (?, ?, ?)");
    $resultado = $stmt->execute([$idMundial, $correoUsuario, $contenido]);
    if ($resultado) {
        $updateCount = $db->prepare("UPDATE Mundial SET comentarios = comentarios + 1 WHERE IDMundial = ?");
        $updateCount->execute([$idMundial]);
        echo json_encode(['status' => 'success', 'message' => 'Comentario agregado exitosamente']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el comentario']);
    }
}
?>