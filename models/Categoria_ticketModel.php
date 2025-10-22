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
    public function getEspecialidadesByCategoria($id_categoria)
    {
        try {
            $vSql = "SELECT id_especialidad, nombre AS especialidad 
                 FROM especialidad 
                 WHERE id_categoria = $id_categoria
                 ORDER BY nombre";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getEtiquetasByCategoria($id_categoria)
    {
        try {
            $vSql =     "SELECT 
                        c.id_categoria AS categoria,
                        e.id_etiqueta,
                        e.nombre AS etiqueta
                FROM categoria_ticket c
                JOIN categoria_etiqueta ce ON c.id_categoria = ce.id_categoria_ticket
                JOIN etiqueta e ON e.id_etiqueta = ce.id_etiqueta
                WHERE c.id_categoria = $id_categoria
                ORDER BY e.id_etiqueta;";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
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
}
