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
}
