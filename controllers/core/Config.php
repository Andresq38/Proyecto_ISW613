<?php 
class Config
{
    private static $config;

    public static function get($key, $default = null)
    {
        if (is_null(self::$config)) {
            // Intentar resolver la ruta al archivo config.php de forma robusta
            $possible = realpath(__DIR__ . '/../../config.php');
            if ($possible && file_exists($possible)) {
                self::$config = require $possible;
            } else {
                // Fallback relativo si realpath falla
                $fallback = __DIR__ . '/../../config.php';
                if (file_exists($fallback)) {
                    self::$config = require $fallback;
                } else {
                    // Último intento subiendo más en la jerarquía
                    $fallback2 = __DIR__ . '/../../../config.php';
                    if (file_exists($fallback2)) {
                        self::$config = require $fallback2;
                    } else {
                        // No se encontró config; dejar array vacío para evitar errores posteriores
                        self::$config = [];
                    }
                }
            }
        }

        return isset(self::$config[$key]) ? self::$config[$key] : $default;
    }
}
