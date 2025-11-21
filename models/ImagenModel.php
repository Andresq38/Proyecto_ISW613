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

    /**
     * Asociar imagen existente con ticket mediante tabla ticket_imagen
     */
    public function asociarATicket($idImagen, $idTicket, $descripcion = null)
    {
        try {
            $sql = "INSERT INTO ticket_imagen (id_ticket, id_imagen, descripcion) VALUES (?, ?, ?)";
            $this->enlace->executePrepared_DML($sql, 'iis', [
                (int)$idTicket, 
                (int)$idImagen, 
                $descripcion
            ]);
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }

    /**
     * Asociar imagen con historial de estados mediante tabla historial_imagen
     * CRÍTICO para cumplir requisito de imágenes obligatorias en cambios de estado
     */
    public function asociarAHistorial($idImagen, $idHistorial)
    {
        try {
            $sql = "INSERT INTO historial_imagen (id_historial_estado, id_imagen) VALUES (?, ?)";
            $this->enlace->executePrepared_DML($sql, 'ii', [
                (int)$idHistorial, 
                (int)$idImagen
            ]);
            return true;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }

    /**
     * Obtener imágenes asociadas a un historial específico
     */
    public function getByHistorial($idHistorial)
    {
        try {
            $sql = "SELECT i.* 
                    FROM imagen i
                    INNER JOIN historial_imagen hi ON i.id_imagen = hi.id_imagen
                    WHERE hi.id_historial_estado = ?";
            $resultado = $this->enlace->executePrepared($sql, 'i', [(int)$idHistorial]);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
            return [];
        }
    }

    /**
     * Contar imágenes asociadas a un historial (para validación)
     */
    public function countByHistorial($idHistorial)
    {
        try {
            $sql = "SELECT COUNT(*) as total 
                    FROM historial_imagen 
                    WHERE id_historial_estado = ?";
            $resultado = $this->enlace->executePrepared($sql, 'i', [(int)$idHistorial]);
            return isset($resultado[0]) ? (int)$resultado[0]->total : 0;
        } catch (Exception $e) {
            handleException($e);
            return 0;
        }
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

    /**
     * Subir imagen para cambio de estado y asociarla automáticamente al historial
     * Retorna el ID de la imagen creada o null en caso de error
     */
    public function uploadForHistorial($file, $idTicket, $idHistorial = null)
    {
        try {
            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            $upload_path = __DIR__ . '/../uploads/';
            $valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];

            // Validaciones
            if (empty($fileName)) {
                return ['success' => false, 'message' => 'Nombre de archivo vacío'];
            }
            
            $fileExt = explode('.', $fileName);
            $fileActExt = strtolower(end($fileExt));
            $newFileName = "historial_" . $idTicket . "_" . time() . "_" . uniqid() . "." . $fileActExt;
            
            if (!in_array($fileActExt, $valid_extensions)) {
                return ['success' => false, 'message' => 'Extensión no permitida. Solo: ' . implode(', ', $valid_extensions)];
            }
            
            if ($fileSize >= 5000000) {
                return ['success' => false, 'message' => 'Archivo muy grande (máximo 5MB)'];
            }
            
            if ($fileError != 0) {
                return ['success' => false, 'message' => 'Error en la carga del archivo'];
            }
            
            // Mover archivo
            if (!move_uploaded_file($tempPath, $upload_path . $newFileName)) {
                return ['success' => false, 'message' => 'Error al mover el archivo'];
            }
            
            // Insertar en BD
            $sql = "INSERT INTO imagen (id_ticket, imagen) VALUES (?, ?)";
            $this->enlace->executePrepared_DML($sql, 'is', [(int)$idTicket, $newFileName]);
            
            // Obtener ID insertado
            $lastIdSql = "SELECT LAST_INSERT_ID() as id";
            $result = $this->enlace->ExecuteSQL($lastIdSql);
            $idImagen = $result[0]->id ?? null;

            // Si se proporciona idHistorial, asociar automáticamente
            if ($idImagen && $idHistorial) {
                $this->asociarAHistorial($idImagen, $idHistorial);
            }
            
            return [
                'success' => true, 
                'id_imagen' => $idImagen,
                'filename' => $newFileName
            ];
        } catch (Exception $e) {
            handleException($e);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
}
