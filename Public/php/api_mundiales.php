<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once "../../App/models/Database.php";

try {
    $db = (new Database())->connect();
    $sql = "SELECT 
        IDMundial AS id,
        paismundial AS country,
        Sede AS sede,
        Year_Mundial AS year,
        imagen_mundial AS imagem,
        resena_mundial AS content,
        likes,
        comentarios
    FROM Mundial
    ORDER BY Year_Mundial ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $mundiales = $stmt->fetchAll(PDO::FETCH_ASSOC);

   foreach ($mundiales as &$m) {
    $m['year'] = substr($m['year'], 0, 4);
    $m['imagem'] = isset($m['imagem']) ? (string)$m['imagem'] : '';
    if (empty($m['imagem'])) {
        $m['imagem'] = 'Imagenes/default-post.jpg';
    }
    if (!isset($m['likes'])) $m['likes'] = 0;
    if (!isset($m['comentarios'])) $m['comentarios'] = 0;
}

    echo json_encode([
        "status" => "success",
        "data" => $mundiales,
        "total" => count($mundiales)
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>