<?php
class etiqueta
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $etiqueta = new EtiquetaModel();
            $result = $etiqueta->all();
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
            $etiqueta = new EtiquetaModel();
            $result = $etiqueta->get($param);
            //Dar respuesta
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
            $inputJSON = $request->getJSON();
            $model = new EtiquetaModel();
            $result = $model->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
