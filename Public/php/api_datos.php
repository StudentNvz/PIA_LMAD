<?php

try {
    $dbPath = dirname(__FILE__) . '/../../App/models/Database.php';
    $publiPath = dirname(__FILE__) . '/../../App/models/DATOS.php';

    if (!file_exists($dbPath)) {
        throw new Exception("No se encuentra Database.php en: " . $dbPath);
    }

    if (!file_exists($publiPath)) {
        throw new Exception("No se encuentra DATOS.php en: " . $publiPath);
    }

    require_once $dbPath;
    require_once $publiPath;

    $metodo = $_SERVER['REQUEST_METHOD'];
    $endpoint = $_GET['endpoint'] ?? '';

    if ($metodo === 'GET') {

        if ($endpoint === 'test') {

            $database = new Database();
            $pdo = $database->connect();

            $stmt = $pdo->query("SELECT COUNT(*) as todas FROM Publicaciones WHERE aprovacion = 1");
            $count = $stmt->fetch();

            ob_clean();
            echo json_encode([
                'status' => 'success',
                'message' => 'API funcionando correctamente',
                'timestamp' => date('Y-m-d H:i:s'),
                'publicaciones_aprobadas' => (int)$count['todas']
            ]);
            exit;
        }

        if ($endpoint === 'todas') {

            $database = new Database();
            $pdo = $database->connect();

            $sql = "SELECT * FROM DatosCuriosos ORDER BY iddato ASC";
            $stmt = $pdo->prepare($sql);

            $stmt->execute();

            $datos = $stmt->fetchAll();

            ob_clean();
            echo json_encode([
                'status' => 'success',
                'data' => $datos,
                'total' => count($datos),
                'endpoint' => 'todas',
            ]);
            exit;

        } else {
            ob_clean();
            echo json_encode([
                'status' => 'error',
                'type' => 'invalid_endpoint',
                'message' => 'Endpoint no válido: ' . $endpoint,
                'debug_info' => [
                    'method' => $metodo,
                    'endpoint' => $endpoint
                ]
            ]);
            exit;
        }
    }

} catch (PDOException $e) {
    ob_clean();
    echo json_encode([
        'status' => 'error',
        'type' => 'database_error',
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'sql_state' => $e->getCode(),

    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'status' => 'error',
        'type' => 'general_error',
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
    ]);
    exit;
}

?>