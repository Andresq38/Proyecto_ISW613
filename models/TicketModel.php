<?php
class TicketModel
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
			$vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        c.nombre AS 'Categoría',
                        e.nombre AS 'Estado actual',
                        CONCAT(
                            FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, 
                            CONVERT_TZ(t.fecha_creacion, '+00:00', '-06:00'), 
                            NOW())) / 60), 'h ',
                            MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, 
                            CONVERT_TZ(t.fecha_creacion, '+00:00', '-06:00'), 
                            NOW())), 60),'m') AS 'Tiempo restante SLA (máx)'
                        FROM 
                            ticket t
                        JOIN 
                            categoria_ticket c ON t.id_categoria = c.id_categoria
                        JOIN 
                            estado e ON t.id_estado = e.id_estado
                        JOIN 
                            sla s ON c.id_sla = s.id_sla
                        ORDER BY 
                            t.id_ticket;";
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ($vSql);
				
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByTecnico($idTecnico){
        try {
            //Consulta sql
			$vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        c.nombre AS 'Categoría',
                        e.nombre AS 'Estado actual',
                        CONCAT(
                        FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())) / 60), 
                         'h ',
                        MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())), 60),
                         'm'
                         ) AS 'Tiempo restante SLA (máx)'
                        FROM 
                            ticket t
                        JOIN 
                            categoria_ticket c ON t.id_categoria = c.id_categoria
                        JOIN 
                            estado e ON t.id_estado = e.id_estado
                        JOIN 
                            sla s ON c.id_sla = s.id_sla
                        WHERE 
                            t.id_tecnico = $idTecnico
                        ORDER BY 
                            t.id_ticket;";
			
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
			$vSql = "SELECT * FROM ticket where id_ticket=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }

// Obtener ticket completo por ID
public function getTicketCompletoById($idTicket) {
    try {
        $vSql = "
            SELECT 
                t.id_ticket AS 'ID Ticket',
                t.titulo AS 'Título',
                t.descripcion AS 'Descripción',
                t.fecha_creacion AS 'Fecha de Creación',
                t.fecha_cierre AS 'Fecha de Cierre',
                t.prioridad AS 'Prioridad',
                t.puntaje AS 'Puntaje',
                t.comentario AS 'Comentario',
                
                u.id_usuario AS 'ID Usuario',
                u.nombre AS 'Nombre Usuario',
                u.correo AS 'Correo Usuario',
                r.descripcion AS 'Rol Usuario',
                
                tec.id_tecnico AS 'ID Técnico',
                u_tec.nombre AS 'Nombre Técnico',
                
                c.nombre AS 'Categoría',
                
                s.nombre AS 'Nombre SLA',
                s.tiempo_respuesta_min,
                s.tiempo_respuesta_max,
                s.tiempo_resolucion_min,
                s.tiempo_resolucion_max,
                
                e.nombre AS 'Estado Actual',
                
                CONCAT(
                    FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())) / 60), 
                    'h ',
                    MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())), 60),
                    'm'
                ) AS 'Tiempo Restante SLA',
                
                GROUP_CONCAT(DISTINCT et.nombre SEPARATOR ', ') AS 'Etiquetas'
                
            FROM ticket t
            JOIN usuario u ON t.id_usuario = u.id_usuario
            JOIN rol r ON u.id_rol = r.id_rol
            JOIN categoria_ticket c ON t.id_categoria = c.id_categoria
            JOIN sla s ON c.id_sla = s.id_sla
            JOIN estado e ON t.id_estado = e.id_estado
            LEFT JOIN tecnico tec ON t.id_tecnico = tec.id_tecnico
            LEFT JOIN usuario u_tec ON tec.id_usuario = u_tec.id_usuario
            LEFT JOIN categoria_etiqueta ce ON c.id_categoria = ce.id_categoria_ticket
            LEFT JOIN etiqueta et ON ce.id_etiqueta = et.id_etiqueta
            WHERE t.id_ticket = $idTicket
            GROUP BY t.id_ticket;
        ";
        return $this->enlace->ExecuteSQL($vSql);
    } catch (Exception $e) {
        handleException($e);
    }
}

// Obtener todos los tickets completos
public function getTicketsCompletos() {
    try {
        $vSql = "
            SELECT 
                t.id_ticket AS 'ID Ticket',
                t.titulo AS 'Título',
                t.descripcion AS 'Descripción',
                t.fecha_creacion AS 'Fecha de Creación',
                t.fecha_cierre AS 'Fecha de Cierre',
                t.prioridad AS 'Prioridad',
                t.puntaje AS 'Puntaje',
                t.comentario AS 'Comentario',
                
                u.id_usuario AS 'ID Usuario',
                u.nombre AS 'Nombre Usuario',
                u.correo AS 'Correo Usuario',
                r.descripcion AS 'Rol Usuario',
                
                tec.id_tecnico AS 'ID Técnico',
                u_tec.nombre AS 'Nombre Técnico',
                
                c.nombre AS 'Categoría',
                
                s.nombre AS 'Nombre SLA',
                s.tiempo_respuesta_min,
                s.tiempo_respuesta_max,
                s.tiempo_resolucion_min,
                s.tiempo_resolucion_max,
                
                e.nombre AS 'Estado Actual',
                
                CONCAT(
                    FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())) / 60), 
                    'h ',
                    MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())), 60),
                    'm'
                ) AS 'Tiempo Restante SLA',
                
                GROUP_CONCAT(DISTINCT et.nombre SEPARATOR ', ') AS 'Etiquetas'
                
            FROM ticket t
            JOIN usuario u ON t.id_usuario = u.id_usuario
            JOIN rol r ON u.id_rol = r.id_rol
            JOIN categoria_ticket c ON t.id_categoria = c.id_categoria
            JOIN sla s ON c.id_sla = s.id_sla
            JOIN estado e ON t.id_estado = e.id_estado
            LEFT JOIN tecnico tec ON t.id_tecnico = tec.id_tecnico
            LEFT JOIN usuario u_tec ON tec.id_usuario = u_tec.id_usuario
            LEFT JOIN categoria_etiqueta ce ON c.id_categoria = ce.id_categoria_ticket
            LEFT JOIN etiqueta et ON ce.id_etiqueta = et.id_etiqueta
            GROUP BY t.id_ticket
            ORDER BY t.fecha_creacion DESC;
        ";
        return $this->enlace->ExecuteSQL($vSql);
    } catch (Exception $e) {
        handleException($e);
    }
}



}
