<?php
class Categoria_ticketModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
    public function all()
    {
        try {
            // Listado con nombre, SLA y conteo de etiquetas (máx 3 campos)
            $vSql = "SELECT 
                        c.id_categoria,
                        c.nombre,
                        s.nombre AS sla_nombre,
                        (SELECT COUNT(*) FROM categoria_etiqueta ce WHERE ce.id_categoria_ticket = c.id_categoria) AS num_etiquetas
                     FROM categoria_ticket c
                     JOIN sla s ON s.id_sla = c.id_sla
                     ORDER BY c.nombre";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Crear categoría con SLA y etiquetas relacionadas */
    public function create($obj)
    {
        try {
            if (empty($obj->nombre) || empty($obj->id_sla)) {
                throw new Exception('Nombre e id_sla son requeridos');
            }
            $nombre = trim($obj->nombre);
            $idSla = (int)$obj->id_sla;
            $sqlIns = "INSERT INTO categoria_ticket (nombre, id_sla) VALUES (?, ?)";
            $newId = $this->enlace->executePrepared_DML_last($sqlIns, 'si', [ $nombre, $idSla ]);

            // Etiquetas opcionales
            if (isset($obj->etiquetas) && is_array($obj->etiquetas) && !empty($obj->etiquetas)) {
                foreach ($obj->etiquetas as $idEtiqueta) {
                    $this->enlace->executePrepared_DML(
                        "INSERT INTO categoria_etiqueta (id_categoria_ticket, id_etiqueta) VALUES (?, ?)",
                        'ii', [ (int)$newId, (int)$idEtiqueta ]
                    );
                }
            }

            // Especialidades opcionales: reasignar especialidades seleccionadas a la nueva categoría
            if (isset($obj->especialidades) && is_array($obj->especialidades) && !empty($obj->especialidades)) {
                // Construir placeholders dinámicos para IN (...)
                $ids = array_map('intval', $obj->especialidades);
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $types = 'i' . str_repeat('i', count($ids)); // primero id_categoria, luego ids
                $params = array_merge([ (int)$newId ], $ids);
                $sqlUpd = "UPDATE especialidad SET id_categoria = ? WHERE id_especialidad IN ($placeholders)";
                $this->enlace->executePrepared_DML($sqlUpd, $types, $params);
            }

            return $this->get($newId);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Actualizar categoría y relaciones de etiquetas */
    public function update($obj)
    {
        try {
            if (empty($obj->id_categoria)) {
                throw new Exception('id_categoria requerido');
            }
            $id = (int)$obj->id_categoria;

            // Construir actualización parcial
            $parts = [];
            $types = '';
            $params = [];
            if (isset($obj->nombre)) { $parts[] = 'nombre = ?'; $types .= 's'; $params[] = trim($obj->nombre); }
            if (isset($obj->id_sla)) { $parts[] = 'id_sla = ?'; $types .= 'i'; $params[] = (int)$obj->id_sla; }
            if (!empty($parts)) {
                $types .= 'i';
                $params[] = $id;
                $this->enlace->executePrepared_DML("UPDATE categoria_ticket SET ".implode(', ', $parts)." WHERE id_categoria = ?", $types, $params);
            }

            // Actualizar etiquetas si vienen
            if (isset($obj->etiquetas) && is_array($obj->etiquetas)) {
                $this->enlace->executePrepared_DML("DELETE FROM categoria_etiqueta WHERE id_categoria_ticket = ?", 'i', [ $id ]);
                foreach ($obj->etiquetas as $idEtiqueta) {
                    $this->enlace->executePrepared_DML(
                        "INSERT INTO categoria_etiqueta (id_categoria_ticket, id_etiqueta) VALUES (?, ?)",
                        'ii', [ $id, (int)$idEtiqueta ]
                    );
                }
            }

            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /*Obtener */
    public function get($id)
    {
        try {
            // Datos básicos de la categoría
            $vSql = "SELECT c.*, s.nombre AS sla_nombre, 
                            s.tiempo_respuesta_min, s.tiempo_respuesta_max,
                            s.tiempo_resolucion_min, s.tiempo_resolucion_max
                     FROM categoria_ticket c
                     JOIN sla s ON s.id_sla = c.id_sla
                     WHERE c.id_categoria = ?";

            $vResultado = $this->enlace->executePrepared($vSql, 'i', [ (int)$id ]);
            if (empty($vResultado)) return null;

            $cat = $vResultado[0];

            // Etiquetas asociadas
            $cat->etiquetas = $this->getEtiquetasByCategoria($id);

            // Especialidades asociadas
            $cat->especialidades = $this->getEspecialidadesByCategoria($id);

            return $cat;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function getEspecialidadesByCategoria($id)
    {
        try {
            $id_local = (int)$id;
            $vSql = "SELECT id_especialidad, nombre AS especialidad 
                 FROM especialidad 
                 WHERE id_categoria = ?
                 ORDER BY nombre";

            $vResultado = $this->enlace->executePrepared($vSql, 'i', [ $id_local ]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getEtiquetasByCategoria($id)
    {
        try {
            $id_local = (int)$id;
            $vSql =     "SELECT 
                        c.id_categoria AS categoria,
                        e.id_etiqueta,
                        e.nombre AS etiqueta
                FROM categoria_ticket c
                JOIN categoria_etiqueta ce ON c.id_categoria = ce.id_categoria_ticket
                JOIN etiqueta e ON e.id_etiqueta = ce.id_etiqueta
                WHERE c.id_categoria = ?
                ORDER BY e.id_etiqueta;";

            $vResultado = $this->enlace->executePrepared($vSql, 'i', [ $id_local ]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }



    /*Obtener detalle de categoría según selección del usuario*/

    //POR EL MOMENTO PUESTO EN COMENTARIO POR PRUEBAS
    /*Obtener los actores de una pelicula */
    /*/public function getActorMovie($idMovie)
    {
        try {
            //Consulta SQL
            $vSQL = "SELECT g.id, g.fname, g.lname, mg.role".
            " FROM actor g, movie_cast mg".
            " where g.id=mg.actor_id and mg.movie_id=$idMovie;";
            //Establecer conexión
            
            //Ejecutar la consulta
            $vResultado = $this->enlace->executeSQL($vSQL);
            //Retornar el resultado
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }*/

    public function getCategoriaByEtiqueta($idEtiqueta)
    {
        try {
            $sql = "SELECT c.id_categoria, c.nombre
                    FROM categoria_ticket c
                    JOIN categoria_etiqueta ce ON c.id_categoria = ce.id_categoria_ticket
                    WHERE ce.id_etiqueta = ?
                    LIMIT 1";
            $res = $this->enlace->executePrepared($sql, 'i', [ (int)$idEtiqueta ]);
            return $res[0] ?? null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Eliminar una categoría si no tiene tickets asociados */
    public function delete($id)
    {
        try {
            $id = (int)$id;
            if ($id <= 0) {
                throw new Exception('ID de categoría inválido');
            }

            // Verificar si existen tickets asociados
            $sqlCount = "SELECT COUNT(*) AS total FROM ticket WHERE id_categoria = ?";
            $countRes = $this->enlace->executePrepared($sqlCount, 'i', [ $id ]);
            $total = (int)($countRes[0]->total ?? 0);
            if ($total > 0) {
                throw new Exception('No se puede eliminar: categoría con tickets asociados');
            }

            // Eliminar categoría; relaciones con especialidad y categoria_etiqueta se eliminan por cascada
            $this->enlace->executePrepared_DML('DELETE FROM categoria_ticket WHERE id_categoria = ?', 'i', [ $id ]);
            return (object)[ 'deleted' => true, 'id_categoria' => $id, 'message' => 'Categoría eliminada correctamente' ];
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
