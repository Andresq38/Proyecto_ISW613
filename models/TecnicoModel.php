<?php
class TecnicoModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
    public function all(){
        try {
            // Listado completo de técnicos con correo y conteo de tickets abiertos (Asignado/En Proceso)
            $vSql = "SELECT 
                        t.id_tecnico,
                        u.nombre AS nombre,
                        u.correo AS correo,
                        (
                          SELECT COUNT(*) FROM ticket tk 
                          WHERE tk.id_tecnico = t.id_tecnico AND tk.id_estado IN (2,3)
                        ) AS tickets_abiertos
                     FROM tecnico t
                     JOIN usuario u ON t.id_usuario = u.id_usuario
                     ORDER BY u.nombre";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Listar técnicos que tienen al menos un ticket asignado */
    public function withTickets(){
        try {
            $vSql = "SELECT t.id_tecnico, u.nombre AS nombre, u.id_usuario
                     FROM tecnico t
                     JOIN usuario u ON t.id_usuario = u.id_usuario
                     WHERE EXISTS (SELECT 1 FROM ticket tk WHERE tk.id_tecnico = t.id_tecnico)
                     ORDER BY u.nombre";

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
        $vSql = "SELECT t.*, 
                            u.nombre AS nombre_usuario, 
                            u.correo AS correo_usuario
                    FROM tecnico t
                    JOIN usuario u ON t.id_usuario = u.id_usuario
            WHERE t.id_tecnico = ?";

        $vResultado = $this->enlace->executePrepared($vSql, 'i', [ (int)$id ]);

            if (empty($vResultado)) {
                return null;
            }
            $tec = $vResultado[0];

            // Carga de trabajo por estado
            $sqlCarga = "SELECT e.nombre AS estado, COUNT(*) AS total
                         FROM ticket t
                         JOIN estado e ON e.id_estado = t.id_estado
                         WHERE t.id_tecnico = ?
                         GROUP BY e.nombre";
            $carga = $this->enlace->executePrepared($sqlCarga, 'i', [ (int)$id ]);
            $tec->carga_trabajo = $carga ?: [];

            // Disponibilidad: usar columna y una calculada segun tickets abiertos (Asignado/En Proceso)
            $sqlAbiertos = "SELECT COUNT(*) AS abiertos FROM ticket WHERE id_tecnico = ? AND id_estado IN (2,3)";
            $abiertos = $this->enlace->executePrepared($sqlAbiertos, 'i', [ (int)$id ]);
            $tec->tickets_abiertos = isset($abiertos[0]->abiertos) ? (int)$abiertos[0]->abiertos : 0;
            $tec->disponibilidad_tabla = isset($tec->disponibilidad) ? (bool)$tec->disponibilidad : null;
            // Regla simple: disponible si tiene menos de 5 tickets abiertos
            $tec->disponibilidad_calculada = $tec->tickets_abiertos < 5;

            // Especialidades derivadas de categorias de tickets asignados
            $sqlEsp = "SELECT DISTINCT es.id_especialidad, es.nombre, es.descripcion
                       FROM ticket t
                       JOIN especialidad es ON es.id_categoria = t.id_categoria
                       WHERE t.id_tecnico = ?";
            $especialidades = $this->enlace->executePrepared($sqlEsp, 'i', [ (int)$id ]);
            $tec->especialidades = $especialidades ?: [];

            return $tec;

        } catch (Exception $e) {
            handleException($e);
        }
    }

    
}
