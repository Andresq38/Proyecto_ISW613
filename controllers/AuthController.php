<?php


class Auth
{
    private $secret;

    public function __construct()
    {
        $this->secret = Config::get('SECRET_KEY');
    }

    public function login()
    {
        try {
            $req = new Request();
            $body = $req->getJSON();
            $response = new Response();

            if (!$body || empty($body->email) || empty($body->password)) {
                return $response->status(400)->toJSON(['error' => 'Email y contraseña son requeridos']);
            }

            $usuarioModel = new UsuarioModel();
            $user = $usuarioModel->findByEmail($body->email);
            if (!$user) {
                return $response->status(401)->toJSON(['error' => 'Credenciales inválidas']);
            }
            if (isset($user->activo) && (int)$user->activo === 0) {
                return $response->status(403)->toJSON(['error' => 'Usuario deshabilitado']);
            }

            $hash = $user->password_hash ?? '';
            $legacy = $user->legacy_password ?? '';
            $ok = false;
            if ($hash) {
                $ok = password_verify($body->password, $hash);
            }
            if (!$ok && $legacy) {
                // Compatibilidad con SHA2(…,256) de MySQL almacenado como hex
                $sha = hash('sha256', (string)$body->password);
                $ok = (strcasecmp($sha, $legacy) === 0);
            }
            if (!$ok) {
                return $response->status(401)->toJSON(['error' => 'Credenciales inválidas']);
            }

            // Actualizar último login (ignorar errores)
            try { $usuarioModel->actualizarUltimoLogin($user->id_usuario); } catch (\Throwable $e) {}

            $now = time();
            $payload = [
                'iss' => 'apiticket',
                'iat' => $now,
                'exp' => $now + 60 * 60 * 8, // 8 horas
                'sub' => $user->id_usuario,
                'email' => $user->correo ?? null,
                'rol' => $user->rol ?? null,
                'name' => $user->nombre ?? null,
            ];
            
            // Usar use statement y alias para evitar problemas
            $token = \Firebase\JWT\JWT::encode($payload, $this->secret, 'HS256');

            return $response->toJSON([
                'token' => $token,
                'user' => [
                    'id' => $user->id_usuario,
                    'email' => $user->correo ?? null,
                    'rol' => $user->rol ?? null,
                    'nombre' => $user->nombre ?? null,
                ]
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function me()
    {
        try {
            $response = new Response();
            $auth = new AuthMiddleware();
            if (!$auth->handle([])) { return; }
            $user = $_SERVER['auth_user'] ?? null;
            return $response->toJSON([ 'user' => $user ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function status()
    {
        try {
            $response = new Response();
            return $response->toJSON([
                'status' => 'ok',
                'message' => 'Backend funcionando correctamente',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '1.0.0'
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
