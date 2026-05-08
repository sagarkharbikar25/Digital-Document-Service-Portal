<?php

class Csrf
{
    public static function generate()
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function verify($token)
    {
        if (empty($_SESSION['csrf_token']) || empty($token)) {
            error_log("CSRF Failure: Session Token=" . ($_SESSION['csrf_token'] ?? 'MISSING') . " | Request Token=" . ($token ?? 'MISSING'));
            return false;
        }
        $match = hash_equals($_SESSION['csrf_token'], $token);
        if (!$match) {
            error_log("CSRF Mismatch: Session=" . $_SESSION['csrf_token'] . " | Request=" . $token);
        }
        return $match;
    }

    public static function getToken()
    {
        return $_SESSION['csrf_token'] ?? self::generate();
    }
}
