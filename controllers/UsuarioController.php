<?php
class usuario
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $usuario = new UsuarioModel();
            $result = $usuario->all();
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
            $usuario = new UsuarioModel();
            $result = $usuario->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POR EL MOMENTO PUESTO EN COMENTARIO POR PRUEBAS
    /*public function getActorMovie($id)
    {
        try {
            $response = new Response();
            $genero = new Categoria_ticketModel;
            $result = $genero->getActorMovie($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    */
}
