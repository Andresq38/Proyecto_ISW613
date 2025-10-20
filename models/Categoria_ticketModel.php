<?php
class Categoria_ticketModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
    public function all(){
        try {
            //Consulta sql
			$vSql = "SELECT * FROM categoria_ticket;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ($vSql);
				
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }
    
    /*Obtener */
    public function get($id)
    {
        try {
            //Consulta sql
			$vSql = "SELECT * FROM categoria_ticket where id_categoria=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }

        /*Obtener detalle de categoría según selección del usuario*/
    public function getCategoria($id)
    {
        try {
            //Consulta sql
			$vSql = "
            SELECT 
                c.id_categoria,
                c.nombre AS categoria,
                s.tiempo_respuesta_max,
                s.tiempo_resolucion_max,
                GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS etiquetas,
                GROUP_CONCAT(DISTINCT esp.nombre ORDER BY esp.nombre SEPARATOR ', ') AS especialidades
            FROM categoria_ticket c
            INNER JOIN sla s ON c.id_sla = s.id_sla
            LEFT JOIN categoria_etiqueta ce ON ce.id_categoria_ticket = c.id_categoria
            LEFT JOIN etiqueta e ON e.id_etiqueta = ce.id_etiqueta
            LEFT JOIN categoria_especialidad cesp ON cesp.id_categoria_ticket = c.id_categoria
            LEFT JOIN especialidad esp ON esp.id_especialidad = cesp.id_especialidad
            WHERE c.id_categoria = $id
            GROUP BY c.id_categoria, c.nombre, s.tiempo_respuesta_max, s.tiempo_resolucion_max
        ";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }
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
