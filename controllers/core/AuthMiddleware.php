<?php


class AuthMiddleware
{
    private $secret;

    public function __construct()
    {
        $this->secret = Config::get('SECRET_KEY');
    }

    private function getAuthHeader()
    {
        $headers = [];
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        }
        // Fallbacks
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['Authorization'])) {
            $headers['Authorization'] = $_SERVER['Authorization'];
        }
        return $headers['Authorization'] ?? '';
    }

    public function handle(array $requiredRoles = [])
    {
        $authHeader = $this->getAuthHeader();
        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            while (ob_get_level()) ob_end_clean(); // Limpiar todos los buffers
            http_response_code(401);
            $error = json_encode(['error' => 'Unauthorized: missing Bearer token']);
            header('Content-Length: ' . strlen($error));
            echo $error;
            die(); // Terminar COMPLETAMENTE la ejecución
        }

        $token = trim(substr($authHeader, 7));
        try {
            $jwtClass = '\\Firebase\\JWT\\JWT';
            $keyClass = '\\Firebase\\JWT\\Key';
            $decoded = $jwtClass::decode($token, new $keyClass($this->secret, 'HS256'));
        } catch (\Throwable $e) {
            while (ob_get_level()) ob_end_clean(); // Limpiar todos los buffers
            http_response_code(401);
            die(json_encode(['error' => 'Unauthorized: invalid token']));
        }

        // Guardar user en servidor para usos posteriores
        $_SERVER['auth_user'] = [
            'id' => $decoded->sub ?? null,
            'email' => $decoded->email ?? null,
            'rol' => $decoded->rol ?? null,
            'name' => $decoded->name ?? null,
        ];

        if (!empty($requiredRoles)) {
            $userRole = $_SERVER['auth_user']['rol'] ?? null;
            $norm = function($r){
                // normaliza roles para evitar problemas de acentos
                $map = [
                    'Técnico' => 'Tecnico',
                    'Tecnico' => 'Tecnico',
                    'Administrador' => 'Administrador',
                    'Cliente' => 'Cliente',
                ];
                return $map[$r] ?? $r;
            };
            $userRoleN = $norm((string)$userRole);
            $allowed = array_map($norm, $requiredRoles);
            if (!$userRoleN || !in_array($userRoleN, $allowed)) {
                while (ob_get_level()) ob_end_clean(); // Limpiar todos los buffers
                http_response_code(403);
                die(json_encode(['error' => 'Forbidden: insufficient role']));
            }
        }

        return true;
    }
}
