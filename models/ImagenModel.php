<?php
class ImagenModel
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
			$vSql = "SELECT * FROM imagen;";
			
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
			$vSql = "SELECT * FROM imagen WHERE id_imagen = ?";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->executePrepared($vSql, 'i', [(int)$id]);
			// Retornar el objeto
			return $vResultado[0] ?? null;
		} catch (Exception $e) {
            handleException($e);
        }
    }

    /* Crear nueva imagen para un ticket (ajustado al esquema actual: imagen(id_ticket, imagen)) */
    public function crear($idTicket, $fileName)
    {
        try {
            $sql = "INSERT INTO imagen (id_ticket, imagen) VALUES (?, ?)";
            $this->enlace->executePrepared_DML($sql, 'is', [(int)$idTicket, (string)$fileName]);

            // Obtener el ID insertado
            $lastIdSql = "SELECT LAST_INSERT_ID() as id";
            $result = $this->enlace->ExecuteSQL($lastIdSql);
            return $result[0]->id ?? null;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /* Métodos de asociación no aplican al esquema actual; se mantienen no operativos por compatibilidad */
    public function asociarATicket($idImagen, $idTicket, $descripcion = null)
    {
        // Esquema actual no usa tabla intermedia ticket_imagen
        return false;
    }

    public function asociarAHistorial($idImagen, $idHistorial)
    {
        // Esquema actual no define tabla historial_imagen
        return false;
    }
    
}
