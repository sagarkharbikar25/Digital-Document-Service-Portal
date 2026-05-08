<?php

class Response
{

    public static function success($data = [], $message = "Success")
    {
        header("Content-Type: application/json");

        echo json_encode([
            "status" => "success",
            "message" => $message,
            "data" => $data
        ]);

        exit;
    }


    public static function error($message = "Error", $code = 400)
    {
        http_response_code($code);

        header("Content-Type: application/json");

        echo json_encode([
            "status" => "error",
            "message" => $message
        ]);

        exit;
    }


    public static function json($data)
    {
        header("Content-Type: application/json");

        echo json_encode($data);

        exit;
    }

}