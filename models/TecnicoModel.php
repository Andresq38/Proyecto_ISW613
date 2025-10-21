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
            // Listado completo de técnicos con su nombre de usuario
            $vSql = "SELECT t.id_tecnico, u.nombre AS nombre, u.id_usuario
                     FROM tecnico t
                     JOIN usuario u ON t.id_usuario = u.id_usuario
                     ORDER BY u.nombre";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
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
                            /*u.apellidos AS apellidos_usuario,*/
                            u.correo AS correo_usuario
                    FROM tecnico t
                    JOIN usuario u ON t.id_usuario = u.id_usuario
            WHERE t.id_tecnico = ?";

        $vResultado = $this->enlace->executePrepared($vSql, 'i', [ (int)$id ]);

            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return null;

        } catch (Exception $e) {
            handleException($e);
        }
    }

    
}
