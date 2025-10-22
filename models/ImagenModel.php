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

    /* Crear nueva imagen */
    public function crear($url, $idUsuario = null, $idHistorial = null)
    {
        try {
            $vSql = "INSERT INTO imagen (url, id_usuario, id_historial) VALUES (?, ?, ?)";
            $this->enlace->executePrepared_DML($vSql, 'ssi', [$url, $idUsuario, $idHistorial]);
            
            // Obtener el ID de la imagen insertada
            $lastIdSql = "SELECT LAST_INSERT_ID() as id";
            $result = $this->enlace->ExecuteSQL($lastIdSql);
            
            return $result[0]->id ?? null;
        } catch (Exception $e) {
            handleException($e);
            return null;
        }
    }

    /* Asociar imagen a ticket */
    public function asociarATicket($idImagen, $idTicket, $descripcion = null)
    {
        try {
            $vSql = "INSERT INTO ticket_imagen (id_ticket, id_imagen, descripcion) VALUES (?, ?, ?)";
            $this->enlace->executePrepared_DML($vSql, 'iis', [(int)$idTicket, (int)$idImagen, $descripcion]);
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }

    /* Asociar imagen a historial */
    public function asociarAHistorial($idImagen, $idHistorial)
    {
        try {
            $vSql = "INSERT INTO historial_imagen (id_historial_estado, id_imagen) VALUES (?, ?)";
            $this->enlace->executePrepared_DML($vSql, 'ii', [(int)$idHistorial, (int)$idImagen]);
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }
    
}
