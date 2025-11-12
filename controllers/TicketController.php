<?php
class ticket
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $ticket = new TicketModel();
            $result = $ticket->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Devuelve las prioridades disponibles desde el ENUM de la tabla ticket.
     * No se consulta la BD: se exponen valores conocidos para poblar el selector del frontend.
     */
    public function prioridades()
    {
        try {
            $response = new Response();
            $response->toJSON(['Baja', 'Media', 'Alta']);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function get($param)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByTecnico($idTecnico)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->getTicketByTecnico($idTecnico);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketCompletoById($idTicket)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->getTicketCompletoById($idTicket);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketByUsuario($idUsuario)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->getTicketByUsuario($idUsuario);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getTicketsCompletos()
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->getTicketsCompletos();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function cambiarEstado()
    {
        try {
            $response = new Response();
            $request = new Request();
            
            // Obtener datos del request (JSON body)
            $data = $request->getJSON();
            
            // Validar que existan los campos requeridos
            if (!isset($data->id_ticket) || !isset($data->id_estado)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Faltan parámetros requeridos: id_ticket, id_estado'
                ]);
                return;
            }
            
            $ticket = new TicketModel();
            $result = $ticket->cambiarEstado(
                $data->id_ticket,
                $data->id_estado,
                $data->observaciones ?? null
            );
            
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

     public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $ticket = new TicketModel();
            //Acción del modelo a ejecutar
            $result = $ticket->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $ticket = new TicketModel();
            //Acción del modelo a ejecutar
            $result = $ticket->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    //DELETE eliminar
    public function delete($idTicket)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->delete($idTicket);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
}
