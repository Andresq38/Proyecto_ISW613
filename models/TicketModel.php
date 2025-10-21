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
                        t.id_ticket AS id_ticket,
                        c.nombre AS categoria,
                        e.nombre AS estado_actual,
                        CONCAT(
                            FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, 
                                CONVERT_TZ(t.fecha_creacion, '+00:00', '-06:00'), 
                                NOW()
                            )) / 60), 
                            'h ',
                            MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, 
                                CONVERT_TZ(t.fecha_creacion, '+00:00', '-06:00'), 
                                NOW()
                            )), 60),
                            'm'
                        ) AS tiempo_restante_sla
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
                        t.id_ticket AS id_ticket,
                        c.nombre AS categoria,
                        e.nombre AS estado_actual,
                        CONCAT(
                        FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())) / 60), 
                         'h ',
                        MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())), 60),
                         'm'
                         ) AS tiempo_restante_sla
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
        // Instancias de los modelos (tendrás que tener estas clases definidas con métodos get())
        $usuarioM = new UsuarioModel();
        $tecnicoM = new TecnicoModel();
        $categoriaM = new Categoria_ticketModel();
        $slaM = new SlaModel();
        $estadoM = new EstadoModel();
        $etiquetaM = new EtiquetaModel();

        // Traer el ticket principal (solo datos básicos y IDs relacionados)
        $sql = "SELECT * FROM ticket WHERE id_ticket = $idTicket";
        $resultado = $this->enlace->executeSQL($sql);

        if (empty($resultado)) {
            return null; // No existe el ticket
        }

        $ticket = $resultado[0];

        // Obtener datos relacionados
        $ticket->usuario = $usuarioM->get($ticket->id_usuario);
        $ticket->tecnico = $tecnicoM->get($ticket->id_tecnico);
        $ticket->categoria = $categoriaM->get($ticket->id_categoria);
        $ticket->sla = $slaM->get($ticket->categoria->id_sla);
        $ticket->estado = $estadoM->get($ticket->id_estado);
        $ticket->etiquetas = $etiquetaM->get($ticket->id_categoria);

        // Calcular tiempo restante SLA (puedes hacerlo aquí o en SLA)
        $fechaCreacion = new DateTime($ticket->fecha_creacion);
        $ahora = new DateTime();
        $minutosPasados = $fechaCreacion->diff($ahora)->days * 24 * 60
                         + $fechaCreacion->diff($ahora)->h * 60
                         + $fechaCreacion->diff($ahora)->i;
        $tiempoRestanteMin = max(0, $ticket->sla->tiempo_resolucion_max - $minutosPasados);
        $horas = floor($tiempoRestanteMin / 60);
        $minutos = $tiempoRestanteMin % 60;
        $ticket->sla->tiempo_restante = "{$horas}h {$minutos}m";

        return $ticket;

    } catch (Exception $e) {
        handleException($e);
    }
}



// Obtener todos los tickets completos


}
