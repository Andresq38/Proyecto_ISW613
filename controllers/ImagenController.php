<?php
class Imagen
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $imagen = new ImagenModel();
            $result = $imagen->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function get($param)
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            $result = $imagen->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getByTicket($ticketId)
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            $result = $imagen->getByTicket($ticketId);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function delete($param)
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            $result = $imagen->delete($param);
            
            if ($result) {
                $response->toJSON(['success' => true, 'message' => 'Imagen eliminada']);
            } else {
                $response->toJSON(['success' => false, 'error' => 'No se pudo eliminar la imagen']);
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            
            if (!isset($_FILES['file']) || empty($_POST['ticket_id'])) {
                $response->toJSON(['success' => false, 'error' => 'Archivo o ticket_id faltante']);
                return;
            }
            
            $object = [
                'file' => $_FILES['file'],
                'ticket_id' => $_POST['ticket_id']
            ];
            
            $result = $imagen->uploadFile($object);
            
            if ($result === true) {
                $response->toJSON(['success' => true, 'message' => 'Imagen creada exitosamente']);
            } else {
                $response->toJSON(['success' => false, 'error' => 'No se pudo guardar la imagen']);
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Endpoint para subir imágenes asociadas a cambios de estado (historial)
     * Requiere: file (archivo), id_ticket, id_historial (opcional)
     * POST /apiticket/imagen/uploadHistorial
     */
    public function uploadHistorial()
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            
            // Validar parámetros requeridos
            if (!isset($_FILES['file'])) {
                $response->toJSON(['success' => false, 'message' => 'Archivo requerido']);
                return;
            }
            
            if (empty($_POST['id_ticket'])) {
                $response->toJSON(['success' => false, 'message' => 'ID de ticket requerido']);
                return;
            }
            
            $idTicket = (int)$_POST['id_ticket'];
            $idHistorial = isset($_POST['id_historial']) ? (int)$_POST['id_historial'] : null;
            
            // Subir archivo y asociar al historial
            $result = $imagen->uploadForHistorial($_FILES['file'], $idTicket, $idHistorial);
            
            if ($result['success']) {
                $response->toJSON([
                    'success' => true,
                    'message' => 'Imagen subida y asociada al historial correctamente',
                    'id_imagen' => $result['id_imagen'],
                    'filename' => $result['filename']
                ]);
            } else {
                $response->toJSON([
                    'success' => false,
                    'message' => $result['message'] ?? 'Error al subir la imagen'
                ]);
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener imágenes asociadas a un historial específico
     * GET /apiticket/imagen/historial/{id_historial}
     */
    public function historial($idHistorial)
    {
        try {
            $response = new Response();
            $imagen = new ImagenModel();
            $result = $imagen->getByHistorial((int)$idHistorial);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
}
