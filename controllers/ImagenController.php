<?php
class imagen
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

    
}
