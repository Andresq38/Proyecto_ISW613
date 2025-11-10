<?php
class TicketModel
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
            //Consulta sql
            $vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        t.titulo AS 'Título',
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
                        ) AS 'Tiempo restante SLA'
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
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByTecnico($idTecnico)
    {
        try {
            //Consulta sql
            $vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        t.titulo AS 'Título',
                        c.nombre AS 'Categoría',
                        e.nombre AS 'Estado actual',
                        CONCAT(
                        FLOOR((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())) / 60), 
                         'h ',
                        MOD((s.tiempo_resolucion_max - TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW())), 60),
                         'm'
                         ) AS 'Tiempo restante SLA'
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
            $vResultado = $this->enlace->executePrepared($vSql, 'i', [(int)$idTecnico]);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByUsuario($idUsuario)
    {
        try {
            $vSql = "SELECT 
                        t.id_ticket AS 'Identificador del Ticket',
                        t.titulo AS 'Título',
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
                        ) AS 'Tiempo restante SLA'
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

            $vResultado = $this->enlace->executePrepared($vSql, 's', [(string)$idUsuario]);
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
            $vResultado = $this->enlace->executePrepared($vSql, 'i', [(int)$id]);
            // Retornar el objeto
            return $vResultado[0] ?? null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Cambiar estado del ticket */
    public function cambiarEstado($idTicket, $nuevoEstado, $observaciones = null)
    {
        try {
            // 1. Actualizar el estado actual del ticket
            $sqlUpdate = "UPDATE ticket SET id_estado = ? WHERE id_ticket = ?";
            $this->enlace->executePrepared_DML($sqlUpdate, 'ii', [(int)$nuevoEstado, (int)$idTicket]);

            // 2. Insertar en historial_estados
            $sqlHistorial = "INSERT INTO historial_estados (id_ticket, id_estado, observaciones) VALUES (?, ?, ?)";
            $this->enlace->executePrepared_DML($sqlHistorial, 'iis', [
                (int)$idTicket,
                (int)$nuevoEstado,
                $observaciones
            ]);

            // 3. Si el nuevo estado es "Cerrado" (id_estado = 5), actualizar fecha_cierre
            if ((int)$nuevoEstado === 5) {
                $sqlCierre = "UPDATE ticket SET fecha_cierre = NOW() WHERE id_ticket = ?";
                $this->enlace->executePrepared_DML($sqlCierre, 'i', [(int)$idTicket]);
            }

            return [
                'success' => true,
                'message' => 'Estado del ticket actualizado correctamente'
            ];
        } catch (Exception $e) {
            handleException($e);
            return [
                'success' => false,
                'message' => 'Error al actualizar el estado del ticket'
            ];
        }
    }

    // Obtener ticket completo por ID
    public function getTicketCompletoById($idTicket)
    {
        try {
            // Instancias de los modelos 
            $usuarioM = new UsuarioModel();
            $tecnicoM = new TecnicoModel();
            $categoriaM = new Categoria_ticketModel();
            $slaM = new SlaModel();
            $estadoM = new EstadoModel();
            $etiquetaM = new EtiquetaModel();

            // Traer el ticket principal (solo datos básicos y IDs relacionados)
            $sql = "SELECT * FROM ticket WHERE id_ticket = ?";
            $resultado = $this->enlace->executePrepared($sql, 'i', [(int)$idTicket]);

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

            // Adjuntar imágenes asociadas al ticket (tabla imagen tiene id_ticket e imagen)
            try {
                $sqlImgs = "SELECT * FROM imagen WHERE id_ticket = ? ORDER BY id_imagen";
                $imgs = $this->enlace->executePrepared($sqlImgs, 'i', [(int)$idTicket]);
                $ticket->imagenes = is_array($imgs) ? $imgs : [];
            } catch (Exception $e) {
                $ticket->imagenes = [];
            }

            return $ticket;
        } catch (Exception $e) {
            handleException($e);
        }
    }




    // Obtener todos los tickets completos
    public function getTicketsCompletos()
    {
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
    	public function create($objeto) {
        try {
            $fechaReact = $objeto->creation_date;
            // Crear un objeto DateTime a partir de la cadena de fecha
            // Convertir la fecha al formato deseado para la base de datos
            $fechaBD = date('Y-m-d', strtotime($fechaReact));
            
            //Consulta sql
            
			$vSql = "INSERT INTO ticket
                (titulo,
                descripcion,
                prioridad,
                id_estado,
                id_usuario,
                id_categoria,
                fecha_creacion)
                VALUES
                ('$objeto->titulo',
                '$objeto->descripcion',
                '$objeto->prioridad',
                '$objeto->id_estado',
                '$objeto->id_usuario',
                '$objeto->id_categoria',
                '$fechaBD');";
			
            //Ejecutar la consulta
			$idTicket = $this->enlace->executeSQL_DML_last( $vSql);
            //Insertar peliculas
			// Retornar el objeto creado
            return $this->get($idTicket);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function update($objeto)
{
    try {
        // Validar que venga el ID del ticket
        if (!isset($objeto->id_ticket)) {
            throw new Exception("El ID del ticket es obligatorio para actualizar.");
        }

        //Construir partes dinámicas de la consulta
        $updates = [];

        if (isset($objeto->titulo)) {
            $updates[] = "titulo = '$objeto->titulo'";
        }

        if (isset($objeto->id_estado)) {
            $updates[] = "id_estado = $objeto->id_estado";
        }

        if (isset($objeto->comentario)) {
            $updates[] = "comentario = '$objeto->comentario'";
        }

        if (isset($objeto->id_tecnico)) {
            $updates[] = "id_tecnico = $objeto->id_tecnico";
        }

        //Si no hay nada que actualizar
        if (empty($updates)) {
            throw new Exception("No hay campos válidos para actualizar el ticket.");
        }

        // 🧩 Armar la consulta final
        $sql = "UPDATE ticket SET " . implode(", ", $updates) .
               " WHERE id_ticket = $objeto->id_ticket";

        // ⚙️ Ejecutar la actualización
        $resultado = $this->enlace->executeSQL_DML($sql);

        // ✅ Retornar el ticket actualizado
        return $this->get($objeto->id_ticket);

    } catch (Exception $e) {
        handleException($e);
    }
}


}
