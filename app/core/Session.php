<?php

class Session
{
    public static function start()
    {
        if (session_status() === PHP_SESSION_NONE)
        {
            /*
             * SESSION LIFETIME: 8 hours (28800 seconds)
             * We force PHP's garbage collector and the browser cookie to match.
             */
            $lifetime = 28800; 

            // 1. ISOLATED STORAGE: Store sessions in project storage to prevent 
            // other PHP apps from triggering GC on our sessions.
            $savePath = dirname(__DIR__, 2) . '/storage/sessions';
            if (!is_dir($savePath)) {
                mkdir($savePath, 0777, true);
            }
            session_save_path($savePath);

            ini_set('session.gc_maxlifetime', $lifetime);
            ini_set('session.cookie_lifetime', $lifetime);
            
            // Ensure GC runs occasionally within our private folder
            ini_set('session.gc_probability', 1);
            ini_set('session.gc_divisor', 100);

            // 2. DYNAMIC PATH: Detect base path for cookies
            $scriptName = $_SERVER['SCRIPT_NAME'] ?? ''; 
            $publicPos = strpos($scriptName, '/public/');
            $path = ($publicPos !== false) ? substr($scriptName, 0, $publicPos) : '/';
            if (empty($path)) $path = '/';
            
            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path'     => $path,
                'domain'   => '',
                'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            session_start();

            // 3. REFRESH COOKIE: Update expiration on every request to keep user active
            if (!empty($_SESSION)) {
                setcookie(
                    session_name(),
                    session_id(),
                    time() + $lifetime,
                    $path,
                    '',
                    isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                    true
                );
            }
        }
    }

    public static function set($key, $value)
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    public static function get($key)
    {
        self::start();
        return $_SESSION[$key] ?? null;
    }

    public static function remove($key)
    {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }

    public static function destroy()
    {
        self::start();
        session_unset();
        session_destroy();

        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
    }
}