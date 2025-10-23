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
        // Usar sesión server-side para autenticación
        if (session_status() !== PHP_SESSION_ACTIVE) session_start();
        if (empty($_SESSION['auth_user'])) {
            while (ob_get_level()) ob_end_clean(); // Limpiar todos los buffers
            http_response_code(401);
            die(json_encode(['error' => 'Unauthorized: no session']));
        }

        // Guardar user en servidor para usos posteriores
        $_SERVER['auth_user'] = $_SESSION['auth_user'];

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
