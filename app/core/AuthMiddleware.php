<?php

require_once __DIR__ . "/Auth.php";

class AuthMiddleware
{

    public static function check()
    {
        if (!Auth::user())
        {
            http_response_code(401);

            echo json_encode([
                "status"=>"error",
                "message"=>"Unauthorized"
            ]);

            exit;
        }
    }

}