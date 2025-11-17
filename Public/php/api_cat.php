<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once "../../App/models/Database.php";

try {
    $db = (new Database())->connect();
    $sql = "SELECT idcat AS id, nombrecategoria AS nombre FROM Categorias ORDER BY nombrecategoria ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $categorias,
        "total" => count($categorias)
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>