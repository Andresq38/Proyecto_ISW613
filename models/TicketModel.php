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
                                NOW()
                            )) / 60), 
                            'h ',
                            MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, 
                                CONVERT_TZ(t.fecha_creacion, '+00:00', '-06:00'), 
                                NOW()
                            )), 60),
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
                            t.id_tecnico = ?
                        ORDER BY 
                            t.id_ticket;";

            //Ejecutar la consulta con prepared statements
			$vResultado = $this->enlace->executePrepared($vSql, 'i', [ (int)$idTecnico ]);
				
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByUsuario($idUsuario){
        try {
            $vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        c.nombre AS 'Categoría',
                        e.nombre AS 'Estado actual',
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
                        t.id_usuario = ?
                    ORDER BY 
                        t.id_ticket;";

            $vResultado = $this->enlace->executePrepared($vSql, 's', [ (string)$idUsuario ]);
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
			$vSql = "SELECT * FROM ticket WHERE id_ticket = ?";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->executePrepared($vSql, 'i', [ (int)$id ]);
			// Retornar el objeto
			return $vResultado[0] ?? null;
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
    $sql = "SELECT * FROM ticket WHERE id_ticket = ?";
    $resultado = $this->enlace->executePrepared($sql, 'i', [ (int)$idTicket ]);

        if (empty($resultado) || !isset($resultado[0])) {
            return null; // No existe el ticket
        }

        $ticket = $resultado[0];

        // Obtener datos relacionados con comprobaciones de existencia
        $ticket->usuario = $usuarioM->get($ticket->id_usuario) ?? null;
        $ticket->tecnico = isset($ticket->id_tecnico) ? ($tecnicoM->get($ticket->id_tecnico) ?? null) : null;
        $ticket->categoria = $categoriaM->get($ticket->id_categoria) ?? null;
        // Obtener SLA usando la categoria si existe
        if ($ticket->categoria && isset($ticket->categoria->id_sla)) {
            $ticket->sla = $slaM->get($ticket->categoria->id_sla) ?? null;
        } else {
            $ticket->sla = null;
        }
        $ticket->estado = $estadoM->get($ticket->id_estado) ?? null;

        // Obtener etiquetas asociadas a la categoria usando el método adecuado
        if ($ticket->categoria && method_exists($categoriaM, 'getEtiquetasByCategoria')) {
            $ticket->etiquetas = $categoriaM->getEtiquetasByCategoria($ticket->categoria->id_categoria);
        } else {
            $ticket->etiquetas = [];
        }

        // Calcular tiempo restante SLA (si existe SLA y tiempo_resolucion_max es numérico)
        if ($ticket->sla && isset($ticket->sla->tiempo_resolucion_max) && is_numeric($ticket->sla->tiempo_resolucion_max)) {
            try {
                $fechaCreacion = new DateTime($ticket->fecha_creacion);
                $ahora = new DateTime();
                $interval = $fechaCreacion->diff($ahora);
                $minutosPasados = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
                $tiempoRestanteMin = max(0, $ticket->sla->tiempo_resolucion_max - $minutosPasados);
                $horas = floor($tiempoRestanteMin / 60);
                $minutos = $tiempoRestanteMin % 60;
                $ticket->sla->tiempo_restante = "{$horas}h {$minutos}m";
            } catch (Exception $e) {
                $ticket->sla->tiempo_restante = null;
            }
        } else {
            $ticket->sla->tiempo_restante = null;
        }

        // Historial de estados
        $sqlHist = "SELECT he.id_historial, he.fecha_cambio, he.observaciones, e.nombre AS estado
                    FROM historial_estados he
                    JOIN estado e ON e.id_estado = he.id_estado
                    WHERE he.id_ticket = ?
                    ORDER BY he.fecha_cambio ASC";
        $historial = $this->enlace->executePrepared($sqlHist, 'i', [ (int)$idTicket ]);

        // Imágenes asociadas directamente al ticket
        $sqlImgsTicket = "SELECT i.id_imagen, i.url
                          FROM imagen i
                          JOIN ticket_imagen ti ON ti.id_imagen = i.id_imagen
                          WHERE ti.id_ticket = ?";
        $imagenesTicket = $this->enlace->executePrepared($sqlImgsTicket, 'i', [ (int)$idTicket ]);

        // Imágenes por cada item de historial
        $imagenesHistorial = [];
        if (!empty($historial)) {
            $sqlImgsHist = "SELECT i.id_imagen, i.url
                            FROM historial_imagen hi
                            JOIN imagen i ON i.id_imagen = hi.id_imagen
                            WHERE hi.id_historial_estado = ?";
            foreach ($historial as $h) {
                $imgs = $this->enlace->executePrepared($sqlImgsHist, 'i', [ (int)$h->id_historial ]);
                $imagenesHistorial[$h->id_historial] = $imgs ?: [];
            }
        }

        $ticket->historial_estados = $historial ?: [];
        $ticket->imagenes = $imagenesTicket ?: [];
        $ticket->imagenes_por_historial = $imagenesHistorial;

        return $ticket;

    } catch (Exception $e) {
        handleException($e);
    }
}



// Obtener todos los tickets completos
public function getTicketsCompletos() {
    try {
        // Instancias de los modelos relacionados
        $usuarioM = new UsuarioModel();
        $tecnicoM = new TecnicoModel();
        $categoriaM = new Categoria_ticketModel();
        $slaM = new SlaModel();
        $estadoM = new EstadoModel();
        $etiquetaM = new EtiquetaModel();

        // Traer todos los tickets
        $sql = "SELECT * FROM ticket";
        $resultado = $this->enlace->executeSQL($sql);

        /** @var array<object> $resultado */
        if (!is_array($resultado) || empty($resultado)) {
            return []; // No hay tickets
        }

        $ticketsCompletos = [];

        foreach ($resultado as $ticket) {
            // Obtener datos relacionados con comprobaciones de existencia
            $ticket->usuario = $usuarioM->get($ticket->id_usuario) ?? null;
            $ticket->tecnico = isset($ticket->id_tecnico) ? ($tecnicoM->get($ticket->id_tecnico) ?? null) : null;
            $ticket->categoria = $categoriaM->get($ticket->id_categoria) ?? null;

            // Obtener SLA usando la categoría si existe
            if ($ticket->categoria && isset($ticket->categoria->id_sla)) {
                $ticket->sla = $slaM->get($ticket->categoria->id_sla) ?? null;
            } else {
                $ticket->sla = null;
            }

            // Obtener estado
            $ticket->estado = $estadoM->get($ticket->id_estado) ?? null;

            // Obtener etiquetas asociadas a la categoría
            if ($ticket->categoria && method_exists($categoriaM, 'getEtiquetasByCategoria')) {
                $ticket->etiquetas = $categoriaM->getEtiquetasByCategoria($ticket->categoria->id_categoria);
            } else {
                $ticket->etiquetas = [];
            }

            // Calcular tiempo restante del SLA (si aplica)
            if ($ticket->sla && isset($ticket->sla->tiempo_resolucion_max) && is_numeric($ticket->sla->tiempo_resolucion_max)) {
                try {
                    $fechaCreacion = new DateTime($ticket->fecha_creacion);
                    $ahora = new DateTime();
                    $interval = $fechaCreacion->diff($ahora);
                    $minutosPasados = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
                    $tiempoRestanteMin = max(0, $ticket->sla->tiempo_resolucion_max - $minutosPasados);
                    $horas = floor($tiempoRestanteMin / 60);
                    $minutos = $tiempoRestanteMin % 60;
                    $ticket->sla->tiempo_restante = "{$horas}h {$minutos}m";
                } catch (Exception $e) {
                    $ticket->sla->tiempo_restante = null;
                }
            } else {
                if ($ticket->sla) $ticket->sla->tiempo_restante = null;
            }

            // Agregar al arreglo final
            $ticketsCompletos[] = $ticket;
        }

        return $ticketsCompletos;

    } catch (Exception $e) {
        handleException($e);
    }
}



}
