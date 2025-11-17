<?php
require_once "Database.php";

class Publicacion {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect(); 
    }
    
    
    public function obtenerTodas($limite = 20, $offset = 0) {
        try {
            $limite = (int)$limite;
            $offset = (int)$offset;
            
            $sql = "SELECT * FROM Publicaciones WHERE aprovacion = 1 ORDER BY fechahora_publicacion DESC LIMIT $limite OFFSET $offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("DEBUG obtenerTodas" . count($resultado) . " publicaciones");
            
            return $resultado;
            
        } catch (PDOException $e) {
            error_log("ERROR obtenerTodas: " . $e->getMessage());
            return [];
        }
    }
    
    public function obtenerPorUsuarioSimple($correo) {
        try {
            
            if (empty($correo)) {
                error_log("ERROR obtenerPorUsuarioSimple: no hay correo");
                return [];
            }
            
            $sql = "SELECT * FROM Publicaciones WHERE correo = ? ORDER BY fechahora_publicacion DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$correo]);
            
            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("DEBUG obtenerPorUsuarioSimple: correo=$correo, resultados=" . count($resultado));
            
           
            return $resultado ?: [];
            
        } catch (PDOException $e) {
            error_log("ERROR obtenerPorUsuarioSimple: " . $e->getMessage());
    
            return [];
        }
    }
    
    public function obtenerPendientes($limite = 50, $offset = 0) {
        try {
            $limite = (int)$limite;
            $offset = (int)$offset;
            
            $sql = "SELECT p.*, u.nombre_completo 
                    FROM Publicaciones p 
                    LEFT JOIN Usuarios u ON p.correo = u.correo 
                    WHERE p.aprovacion = 0 OR p.aprovacion IS NULL 
                    ORDER BY p.fechahora_publicacion DESC 
                    LIMIT $limite OFFSET $offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("DEBUG obtenerPendientes: encontradas " . count($resultado) . " publicaciones pendientes");
            
            return $resultado;
            
        } catch (PDOException $e) {
            error_log("ERROR en obtenerPendientes: " . $e->getMessage());
            return [];
        }
    }
    

    public function aprobarPublicacion($idPublicacion) {
        try {
            $sql = "UPDATE Publicaciones SET aprovacion = 1, fechahora_aprovacion = NOW() WHERE id_publicacion = ?";
            $stmt = $this->db->prepare($sql);
            $resultado = $stmt->execute([$idPublicacion]);
            
            error_log("DEBUG aprobarPublicacion: ID=$idPublicacion, resultado=" . ($resultado ? 'éxito' : 'fallo'));
            
            return $resultado;
            
        } catch (PDOException $e) {
            error_log("ERROR en aprobarPublicacion: " . $e->getMessage());
            return false;
        }
    }
    

    public function rechazarPublicacion($idPublicacion) {
        try {
            $sql = "DELETE FROM Publicaciones WHERE id_publicacion = ?";
            $stmt = $this->db->prepare($sql);
            $resultado = $stmt->execute([$idPublicacion]);
            
            error_log("DEBUG rechazarPublicacion: ID=$idPublicacion, resultado=" . ($resultado ? 'éxito' : 'fallo'));
            
            return $resultado;
            
        } catch (PDOException $e) {
            error_log("ERROR en rechazarPublicacion: " . $e->getMessage());
            return false;
        }
    }
    
   
    public function crear($datos) {
        try {
            $sql = "INSERT INTO Publicaciones 
                    (contenido, titulo, media, aprovacion, likes, comentarios, fechahora_publicacion, 
                     pais_publicacion, correo, fk_Categoria, fk_Mundial) 
                    VALUES (?, ?, ?, 0, 0, 0, NOW(), ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($sql);
            $resultado = $stmt->execute([
                $datos['contenido'],
                $datos['titulo'],
                $datos['media'] ?? null,
                $datos['pais_publicacion'],
                $datos['correo'],
                $datos['fk_Categoria'] ?? null,
                $datos['fk_Mundial'] ?? null
            ]);
            
            if ($resultado) {
                return $this->db->lastInsertId();
            }
            
            return false;
            
        } catch (PDOException $e) {
            error_log("ERROR en crear publicación: " . $e->getMessage());
            return false;
        }
    }
    
  public function editar($datos) {
    try {
        $sql = "UPDATE Publicaciones SET 
                    titulo = ?, 
                    contenido = ?, 
                    pais_publicacion = ?, 
                    fk_Categoria = ?, 
                    fk_Mundial = ?"
                . (isset($datos['media']) && $datos['media'] !== null ? ", media = ?" : "")
                . " WHERE id_publicacion = ?";
        $params = [
            $datos['titulo'],
            $datos['contenido'],
            $datos['pais_publicacion'],
            $datos['fk_Categoria'],
            $datos['fk_Mundial']
        ];
        if (isset($datos['media']) && $datos['media'] !== null) {
            $params[] = $datos['media'];
        }
        $params[] = $datos['id_publicacion'];
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    } catch (PDOException $e) {
        error_log("ERROR en editar publicación: " . $e->getMessage());
        return false;
    }
}
    
  public function eliminar($id_publicacion, $correo) {
    try {
        $sqlLikes = "DELETE FROM likespublicacion WHERE id_publicacion = ?";
        $stmtLikes = $this->db->prepare($sqlLikes);
        $stmtLikes->execute([$id_publicacion]);
        $sql = "DELETE FROM Publicaciones WHERE id_publicacion = ? AND correo = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id_publicacion, $correo]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("ERROR en eliminar publicación: " . $e->getMessage());
        return false;
    }
}
    
    public function obtenerCategorias() {
        try {
            $sql = "SELECT * FROM Categorias ORDER BY nombrecategoria";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log("ERROR en obtenerCategorias: " . $e->getMessage());
            return [];
        }
    }
    
    public function obtenerMundiales() {
        try {
            $sql = "SELECT * FROM Mundial ORDER BY Year_Mundial DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log("ERROR en obtenerMundiales: " . $e->getMessage());
            return [];
        }
    }


    public function buscarPubli($categoria = null, $year = null, $pais = null, $sede = null, $usuario = null, $texto = null) {
    try {
        $sql = "SELECT p.*, c.nombrecategoria AS categoria, m.paismundial AS mundial, m.Year_Mundial AS year, u.nombre_completo AS usuario
                FROM Publicaciones p
                LEFT JOIN Categorias c ON p.fk_Categoria = c.idcat
                LEFT JOIN Mundial m ON p.fk_Mundial = m.IDMundial
                LEFT JOIN Usuarios u ON p.correo = u.correo
                WHERE p.aprovacion = 1";
        $params = [];

        if ($categoria) {
            $sql .= " AND c.nombrecategoria LIKE ?";
            $params[] = "%$categoria%";
        }
        if ($year) {
            $sql .= " AND m.Year_Mundial = ?";
            $params[] = $year;
        }
        if ($pais) {
            $sql .= " AND (p.pais_publicacion LIKE ? OR m.paismundial LIKE ?)";
            $params[] = "%$pais%";
            $params[] = "%$pais%";
        }
        if ($sede) {
            $sql .= " AND m.paismundial LIKE ?";
            $params[] = "%$sede%";
        }
        if ($usuario) {
            $sql .= " AND (u.nombre_completo LIKE ? OR p.correo LIKE ?)";
            $params[] = "%$usuario%";
            $params[] = "%$usuario%";
        }
        if ($texto) {
            $sql .= " AND (p.titulo LIKE ? OR p.contenido LIKE ?)";
            $params[] = "%$texto%";
            $params[] = "%$texto%";
        }

        $sql .= " ORDER BY p.fechahora_publicacion DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        error_log("ERROR en buscarPublicaciones: " . $e->getMessage());
        return [];
    }
}













}

?>