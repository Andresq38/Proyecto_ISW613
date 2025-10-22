<?php
class UsuarioModel
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
			$vSql = "SELECT * FROM usuario;";
			
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
            $vSql = "SELECT * FROM usuario WHERE id_usuario = ?";
            
            //Ejecutar la consulta
            $vResultado = $this->enlace->executePrepared($vSql, 's', [ (string)$id ]);
            
            // Verificar si hay resultados antes de retornar
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return null; // o lanzar una excepción, depende de cómo manejes la app
            
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Buscar por email */
    public function findByEmail($email)
    {
        try {
            // La tabla usuario actual solo tiene 'password' (SHA-256), no password_hash
            // Devolvemos password como legacy_password para compatibilidad con AuthController
            $sql = "SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.descripcion AS rol, 
                           u.password AS legacy_password
                    FROM usuario u
                    LEFT JOIN rol r ON r.id_rol = u.id_rol
                    WHERE u.correo = ?
                    LIMIT 1";
            $res = $this->enlace->executePrepared($sql, 's', [ (string)$email ], 'asoc');
            if (!empty($res)) {
                return (object)$res[0];
            }
            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Actualiza último inicio de sesión */
    public function actualizarUltimoLogin($idUsuario)
    {
        try {
            // La tabla usuario actual no tiene la columna ultimo_login
            // Comentamos temporalmente hasta que se agregue la columna
            // $sql = "UPDATE usuario SET ultimo_login = NOW() WHERE id_usuario = ?";
            // return $this->enlace->executePrepared_DML($sql, 'i', [ (int)$idUsuario ]);
            return true;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
     //POR EL MOMENTO PUESTO EN COMENTARIO POR PRUEBAS
    /*Obtener los actores de una pelicula */
    /*/public function getActorMovie($idMovie)
    {
        try {
            //Consulta SQL
            $vSQL = "SELECT g.id, g.fname, g.lname, mg.role".
            " FROM actor g, movie_cast mg".
            " where g.id=mg.actor_id and mg.movie_id=$idMovie;";
            //Establecer conexión
            
            //Ejecutar la consulta
            $vResultado = $this->enlace->executeSQL($vSQL);
            //Retornar el resultado
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }*/
    
}
