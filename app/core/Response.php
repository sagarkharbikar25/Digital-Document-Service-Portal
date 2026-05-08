<?php

class Response
{
    public static function success($message = "", $data = [])
    {
        http_response_code(200);

        echo json_encode([
            "success" => true,
            "message" => $message,
            "data" => $data,
            "error" => null
        ]);

        exit;
    }

    public static function error($message = "", $code = 400, $error = null)
    {
        http_response_code($code);

        echo json_encode([
            "success" => false,
            "message" => $message,
            "data" => null,
            "error" => $error
        ]);

        exit;
    }

    public static function serverError($message = "Internal server error")
    {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => $message,
            "data" => null,
            "error" => "SERVER_ERROR"
        ]);

        exit;
    }
}