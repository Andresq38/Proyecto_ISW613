<?php
class EtiquetaModel
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
			$vSql = "SELECT * FROM etiqueta;";
			
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
			$vSql = "SELECT * FROM etiqueta where id_etiqueta=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }

    /** Crear etiqueta y opcionalmente asociarla a categorías */
    public function create($obj)
    {
        try {
            if (empty($obj->nombre)) {
                throw new Exception('Nombre es requerido');
            }
            $nombre = trim($obj->nombre);
            $sqlIns = "INSERT INTO etiqueta (nombre) VALUES (?)";
            $newId = $this->enlace->executePrepared_DML_last($sqlIns, 's', [ $nombre ]);

            // Asociaciones opcionales con categorias
            if (isset($obj->categorias) && is_array($obj->categorias) && !empty($obj->categorias)) {
                foreach ($obj->categorias as $idCat) {
                    $this->enlace->executePrepared_DML(
                        "INSERT INTO categoria_etiqueta (id_categoria_ticket, id_etiqueta) VALUES (?, ?)",
                        'ii', [ (int)$idCat, (int)$newId ]
                    );
                }
            }

            return $this->get($newId);
        } catch (Exception $e) {
            handleException($e);
        }
    }

}
