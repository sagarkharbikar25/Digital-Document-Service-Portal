<?php

class Session
{
    public static function start()
    {
        if (session_status() === PHP_SESSION_NONE)
        {
            /*
             * PERMANENT FIX: PHP's default session.gc_maxlifetime is only
             * 1440 seconds (24 min). Even though the cookie says 24hrs,
             * PHP destroys the session data after 24min of inactivity.
             * We force both to match: 24 hours.
             */
            $lifetime = 86400; // 24 hours

            ini_set('session.gc_maxlifetime', $lifetime);
            ini_set('session.cookie_lifetime', $lifetime);

            // Robust base path detection (Project Root)
            $scriptName = $_SERVER['SCRIPT_NAME']; 
            $publicPos = strpos($scriptName, '/public/');
            if ($publicPos !== false) {
                $path = substr($scriptName, 0, $publicPos); 
            } else {
                $path = '/';
            }
            if (empty($path)) $path = '/';
            
            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path'     => $path,
                'domain'   => '',
                'secure'   => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            session_start();

            /* Refresh the cookie on every request so it doesn't expire
               while the user is actively using the portal */
            if (!empty($_SESSION)) {
                setcookie(
                    session_name(),
                    session_id(),
                    time() + $lifetime,
                    '/',
                    '',
                    false,
                    true
                );
            }
        }
        // If PHP_SESSION_ACTIVE — already started by index.php, do nothing
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