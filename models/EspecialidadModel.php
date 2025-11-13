<?php
class EspecialidadModel
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
			$vSql = "SELECT * FROM especialidad;";
			
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
			$vSql = "SELECT * FROM especialidad where id_especialidad=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }
  
    /** Crear especialidad (nombre, id_sla, id_categoria son requeridos). descripcion = nombre */
    public function create($obj)
    {
        try {
            if (empty($obj->nombre) || empty($obj->id_sla) || !isset($obj->id_categoria)) {
                throw new Exception('Nombre, id_sla e id_categoria son requeridos');
            }
            $nombre = trim($obj->nombre);
            // según requerimiento, la descripción será igual al nombre
            $descripcion = $nombre;
            $idSla = (int)$obj->id_sla;
            $idCategoria = (int)$obj->id_categoria;

            $sqlIns = "INSERT INTO especialidad (nombre, descripcion, id_sla, id_categoria) VALUES (?, ?, ?, ?)";
            $types = 'ssii';
            $params = [ $nombre, $descripcion, $idSla, $idCategoria ];

            $newId = $this->enlace->executePrepared_DML_last($sqlIns, $types, $params);

            return $this->get($newId);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
}
