<?php

class Config
{
    private static $config = [];

    public static function load($file)
    {
        if (!file_exists($file)) {
            return;
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;

            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \"'");
            
            self::$config[$name] = $value;
            $_ENV[$name] = $value;
        }
    }

    public static function get($key, $default = null)
    {
        return self::$config[$key] ?? $_ENV[$key] ?? $default;
    }
}
