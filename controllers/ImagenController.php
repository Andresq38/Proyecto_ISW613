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

    public function upload()
    {
        try {
            $response = new Response();
            
            // Verificar que se haya enviado un archivo
            if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'No se recibió ninguna imagen o hubo un error en la carga'
                ]);
                return;
            }

            // Obtener parámetros adicionales
            $idTicket = isset($_POST['id_ticket']) ? (int)$_POST['id_ticket'] : null;
            $idUsuario = isset($_POST['id_usuario']) ? $_POST['id_usuario'] : null;
            $descripcion = isset($_POST['descripcion']) ? $_POST['descripcion'] : null;

            // Validar que el ticket exista
            if (!$idTicket) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'El ID del ticket es requerido'
                ]);
                return;
            }

            // Configuración de upload
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Generar nombre único para el archivo
            $file = $_FILES['imagen'];
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
            
            if (!in_array(strtolower($extension), $allowedExtensions)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Tipo de archivo no permitido. Solo se permiten: ' . implode(', ', $allowedExtensions)
                ]);
                return;
            }

            // Validar tamaño (5MB máximo)
            if ($file['size'] > 5 * 1024 * 1024) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'El archivo es demasiado grande. Máximo 5MB'
                ]);
                return;
            }

            $fileName = 'ticket_' . $idTicket . '_' . uniqid() . '.' . $extension;
            $filePath = $uploadDir . $fileName;

            // Mover archivo al directorio de uploads
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Error al guardar el archivo'
                ]);
                return;
            }

            // Guardar información en base de datos
            $url = '/apiticket/uploads/' . $fileName;
            $imagenModel = new ImagenModel();
            $idImagen = $imagenModel->crear($url, $idUsuario, null);

            if (!$idImagen) {
                // Si falla, eliminar el archivo
                unlink($filePath);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Error al registrar la imagen en la base de datos'
                ]);
                return;
            }

            // Asociar imagen al ticket
            $asociado = $imagenModel->asociarATicket($idImagen, $idTicket, $descripcion);

            if (!$asociado) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Error al asociar la imagen al ticket'
                ]);
                return;
            }

            $response->toJSON([
                'success' => true,
                'message' => 'Imagen subida correctamente',
                'data' => [
                    'id_imagen' => $idImagen,
                    'url' => $url,
                    'nombre' => $fileName
                ]
            ]);

        } catch (Exception $e) {
            handleException($e);
        }
    }
}
