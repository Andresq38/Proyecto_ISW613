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

    /* Obtener imágenes por ticket */
    public function getByTicket($idTicket)
    {
        try {
            $vSql = "SELECT * FROM imagen WHERE id_ticket = ?";
            $vResultado = $this->enlace->executePrepared($vSql, 'i', [(int)$idTicket]);
            return $vResultado;
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

    /* Eliminar imagen */
    public function delete($idImagen)
    {
        try {
            // Primero obtener el nombre del archivo
            $imagen = $this->get($idImagen);
            if ($imagen && isset($imagen->imagen)) {
                // Eliminar archivo físico
                $filePath = __DIR__ . '/../uploads/' . $imagen->imagen;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
            
            // Eliminar registro de BD
            $sql = "DELETE FROM imagen WHERE id_imagen = ?";
            $this->enlace->executePrepared_DML($sql, 'i', [(int)$idImagen]);
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
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

    public function uploadFile($object)
    {
        try {
            $file = $object['file'];
            $ticket_id = (int)$object['ticket_id'];
            
            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            $upload_path = __DIR__ . '/../uploads/';
            $valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];

            if (empty($fileName)) {
                return false;
            }
            
            $fileExt = explode('.', $fileName);
            $fileActExt = strtolower(end($fileExt));
            $newFileName = "ticket_" . $ticket_id . "_" . uniqid() . "." . $fileActExt;
            
            if (!in_array($fileActExt, $valid_extensions)) {
                return false;
            }
            
            if (file_exists($upload_path . $newFileName)) {
                return false;
            }
            
            if ($fileSize >= 5000000 || $fileError != 0) {
                return false;
            }
            
            if (!move_uploaded_file($tempPath, $upload_path . $newFileName)) {
                return false;
            }
            
            $sql = "INSERT INTO imagen (id_ticket, imagen) VALUES (?, ?)";
            $this->enlace->executePrepared_DML($sql, 'is', [$ticket_id, (string)$newFileName]);
            
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }
    
}
