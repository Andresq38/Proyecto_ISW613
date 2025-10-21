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
            //Consulta sql
			$vSql = "SELECT * FROM tecnico;";
			
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
