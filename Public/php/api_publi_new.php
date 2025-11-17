<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');
error_log("API_PUBLI: method=" . $_SERVER['REQUEST_METHOD'] . " endpoint=" . ($_GET['endpoint'] ?? 'NO_ENDPOINT'));
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Preflight OPTIONS']);
    exit;
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
        $dbPath = dirname(__FILE__) . '/../../App/models/Database.php';
        $publiPath = dirname(__FILE__) . '/../../App/models/Publi.php';
        
        if (!file_exists($dbPath)) {
            throw new Exception("No se encuentra Database.php en: " . $dbPath);
        }
        
        if (!file_exists($publiPath)) {
            throw new Exception("No se encuentra Publi.php en: " . $publiPath);
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
                    
                
                    $limite = (int)($_GET['limite'] ?? 50);
                    
                
                    if ($limite <= 0) {
                        $limite = 50;
                    }
                    if ($limite > 100) {
                        $limite = 100; 
                    }
                    
                
                    $sql = "SELECT 
                                p.id_publicacion,
                    p.titulo,
                    p.contenido,
                    p.fechahora_publicacion,
                    p.aprovacion,
                    p.likes,
                    p.comentarios,
                    p.pais_publicacion,
                    p.correo,
                    p.fk_Categoria,
                    p.fk_Mundial,
                    c.nombrecategoria AS categoria,
                    m.paismundial AS mundial,
                    CASE 
                        WHEN p.media IS NOT NULL AND LENGTH(p.media) > 0 THEN 'tiene_blob'
                        ELSE 'sin_imagen' 
                    END as media_info,
                    LENGTH(p.media) as media_size
                        FROM Publicaciones p
                        LEFT JOIN Categorias c ON p.fk_Categoria = c.idcat
                        LEFT JOIN Mundial m ON p.fk_Mundial = m.IDMundial
                        WHERE p.aprovacion = 1
                        ORDER BY p.fechahora_publicacion DESC
                        LIMIT :limite";
                    
                    $stmt = $pdo->prepare($sql);
                    
                    
                    $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
                    $stmt->execute();
                    
                    $publicaciones = $stmt->fetchAll();
                    
                    
                    foreach ($publicaciones as &$pub) {
                        $pub['tiene_imagen_blob'] = ($pub['media_info'] === 'tiene_blob');
                        $pub['tamaño_imagen_kb'] = $pub['media_size'] ? round($pub['media_size'] / 1024, 2) : 0;
                        
                    
                        if ($pub['tiene_imagen_blob']) {
                            $pub['imagen_blob_url'] = "Public/php/show_image_blob.php?id=" . $pub['id_publicacion'];
                        }
                    }
                    
                    error_log("API: Encontradas " . count($publicaciones) . " publicaciones aprobadas (límite: $limite)");
                    
                    ob_clean();
                    echo json_encode([
                        'status' => 'success',
                        'data' => $publicaciones,
                        'total' => count($publicaciones),
                        'endpoint' => 'todas',
                        'debug' => [
                            'limite_aplicado' => $limite,
                            'total_encontradas' => count($publicaciones),
                            'timestamp' => date('Y-m-d H:i:s'),
                            'sql_ejecutado' => str_replace(':limite', $limite, $sql)
                        ]
                    ]);
                    exit;
                    
                } 
                
                if ($endpoint === 'todas2') {
                
                    $database = new Database();
                    $pdo = $database->connect();      
                
                    $sql = "SELECT 
                                p.id_publicacion,
                    p.titulo,
                    p.contenido,
                    p.fechahora_publicacion,
                    p.aprovacion,
                    p.likes,
                    p.comentarios,
                    p.pais_publicacion,
                    p.correo,
                    p.fk_Categoria,
                    p.fk_Mundial,
                    c.nombrecategoria AS categoria,
                    m.paismundial AS mundial,
                    CASE 
                        WHEN p.media IS NOT NULL AND LENGTH(p.media) > 0 THEN 'tiene_blob'
                        ELSE 'sin_imagen' 
                    END as media_info,
                    LENGTH(p.media) as media_size
                        FROM Publicaciones p
                        LEFT JOIN Categorias c ON p.fk_Categoria = c.idcat
                        LEFT JOIN Mundial m ON p.fk_Mundial = m.IDMundial
                        ORDER BY p.fechahora_publicacion DESC";
                    
                    $stmt = $pdo->prepare($sql);
                
                    $stmt->execute();
                    
                    $publicaciones = $stmt->fetchAll();
                    
                    
                    foreach ($publicaciones as &$pub) {
                        $pub['tiene_imagen_blob'] = ($pub['media_info'] === 'tiene_blob');
                        $pub['tamaño_imagen_kb'] = $pub['media_size'] ? round($pub['media_size'] / 1024, 2) : 0;
                        
                    
                        if ($pub['tiene_imagen_blob']) {
                            $pub['imagen_blob_url'] = "Public/php/show_image_blob.php?id=" . $pub['id_publicacion'];
                        }
                    }
                    
                    error_log("API: Encontradas " . count($publicaciones) . " publicaciones aprobadas (límite: $limite)");
                    
                    ob_clean();
                    echo json_encode([
                        'status' => 'success',
                        'data' => $publicaciones,
                        'total' => count($publicaciones),
                        'endpoint' => 'todas2',
                        
                    ]);
                    exit;
                } elseif ($endpoint === 'usuario') {
                    $correo = $_GET['correo'] ?? '';
                    
                    if (empty($correo)) {
                        ob_clean();
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Parámetro correo es requerido',
                            'endpoint' => 'usuario'
                        ]);
                        exit;
                    }
                    $publicacion = new Publicacion();
                    $publicaciones = $publicacion->obtenerPorUsuarioSimple($correo);
                    
                    foreach ($publicaciones as &$pub) {
                            if (!empty($pub['media'])) {
                                $pub['tiene_imagen_blob'] = true;
                                $pub['imagen_blob_url'] = "Public/php/show_image_blob.php?id=" . $pub['id_publicacion'];
                                $pub['tamaño_imagen_kb'] = isset($pub['media']) ? round(strlen($pub['media']) / 1024, 2) : 0;
                            } else {
                                $pub['tiene_imagen_blob'] = false;
                                $pub['imagen_blob_url'] = '';
                                $pub['tamaño_imagen_kb'] = 0;
                            }
                        }

                    ob_clean();
                    echo json_encode([
                        'status' => 'success',
                        'data' => $publicaciones,
                        'total' => count($publicaciones),
                        'correo' => $correo,
                        'endpoint' => 'usuario'
                    ]);
                    exit;
                    
                } elseif ($endpoint === 'buscar') {
                    $categoria = $_GET['categoria'] ?? null;
                    $year = $_GET['year'] ?? null;
                    $pais = $_GET['pais'] ?? null;
                    $sede = $_GET['sede'] ?? null;
                    $usuario = $_GET['usuario'] ?? null;
                    $texto = $_GET['texto'] ?? null;

                    $publicacion = new Publicacion();
                    $resultados = $publicacion->buscarPubli($categoria, $year, $pais, $sede, $usuario, $texto);

                    ob_clean();
                    echo json_encode([
                        'status' => 'success',
                        'data' => $resultados,
                        'total' => count($resultados),
                        'endpoint' => 'buscar'
                    ]);
                    exit;
                }

            }          
            if ($metodo === 'POST' && $endpoint === 'editar') {
                $raw = file_get_contents('php://input');
                error_log('EDITAR RAW INPUT: ' . $raw);
                $input = json_decode($raw, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    ob_clean();
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'JSON inválido en el cuerpo',
                        'json_error' => json_last_error_msg(),
                        'raw' => $raw
                    ]);
                    exit;
                }

                $id = $input['id_publicacion'] ?? null;
                $titulo = $input['titulo'] ?? '';
                $contenido = $input['contenido'] ?? '';
                $pais = $input['pais_publicacion'] ?? '';
                $fk_categoria = $input['fk_Categoria'] ?? null;
                $fk_mundial = $input['fk_Mundial'] ?? null;
                $foto_base64 = $input['foto_base64'] ?? null;

                if (!$id) {
                    ob_clean();
                    echo json_encode(['status' => 'error', 'message' => 'ID de publicación requerido']);
                    exit;
                }

                $mediaBlob = null;
                 if ($foto_base64 && strpos($foto_base64, 'base64,') !== false) {
                        $mediaBlob = base64_decode(explode('base64,', $foto_base64)[1]);
                        error_log('EDITAR: Imagen recibida, tamaño (bytes): ' . strlen($mediaBlob));
                    } else {
                        error_log('EDITAR: No se recibió imagen nueva');
                    }

                $publicacion = new Publicacion();
                $ok = $publicacion->editar([
                    'id_publicacion' => $id,
                    'titulo' => $titulo,
                    'contenido' => $contenido,
                    'pais_publicacion' => $pais,
                    'fk_Categoria' => $fk_categoria,
                    'fk_Mundial' => $fk_mundial,
                    'media' => $mediaBlob
                ]);


                ob_clean();
                echo json_encode([
                    'status' => $ok ? 'success' : 'error',
                    'message' => $ok ? 'Publi editada correctamente' : 'No se pudo editar la publi',
                    'debug' => [
                        'input' => $input,
                        'mediaBlob' => $mediaBlob ? 'ok' : 'null',
                        'id' => $id
                    ]
                ]);
                exit;
            }
            if ($metodo === 'DELETE' && $endpoint === 'eliminar') {
                parse_str(file_get_contents("php://input"), $input);
                $id = $input['id_publicacion'] ?? $_GET['id_publicacion'] ?? null;
                $correo = $input['correo'] ?? $_GET['correo'] ?? null;
                error_log("ELIMINAR: id=$id, correo=$correo");
                if (!$id || !$correo) {
                    ob_clean();
                    echo json_encode(['status' => 'error', 'message' => 'ID y correo requeridos']);
                    exit;
                }

                $publicacion = new Publicacion();
                $ok = $publicacion->eliminar($id, $correo);
                //error_log("ELIMINAR SQL: filas afectadas=" . $stmt->rowCount());
                ob_clean();
                echo json_encode([
                    'status' => $ok ? 'success' : 'error',
                    'message' => $ok ? 'Publi eliminada' : 'No se pudo eliminar publi'
                ]);
                exit;
            }
        }
catch (PDOException $e) {
            ob_clean();
            echo json_encode([
                'status' => 'error',
                'type' => 'database_error',
                'message' => 'Error de base de datos: ' . $e->getMessage(),
                'error_code' => $e->getCode(),
                'sql_state' => $e->getCode(),
                'debug_info' => [
                    'endpoint' => $endpoint ?? 'unknown',
                    'limite' => $limite ?? 'not_set'
                ]
            ]);
            exit;
        }
        catch (Exception $e) {
            ob_clean();
            echo json_encode([
                'status' => 'error',
                'type' => 'general_error',
                'message' => 'Error del servidor: ' . $e->getMessage(),
                'file' => basename($e->getFile()),
                'line' => $e->getLine(),
                'debug_info' => [
                    'endpoint' => $endpoint ?? 'unknown',
                    'method' => $metodo ?? 'unknown'
                ]
            ]);
            exit;
        }
?>