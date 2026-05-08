<?php

class ErrorHandler
{
    public static function handleException(Throwable $exception)
    {
        $code = $exception->getCode() ?: 500;
        if (!is_int($code) || $code < 100 || $code > 599) {
            $code = 500;
        }

        http_response_code($code);
        header("Content-Type: application/json");

        $response = [
            "success" => false,
            "status"  => "error",
            "message" => $exception->getMessage()
        ];

        // Only show file/line in development (if needed, otherwise keep clean)
        // $response["file"] = $exception->getFile();
        // $response["line"] = $exception->getLine();

        echo json_encode($response);
        exit();
    }

    public static function handleError($errno, $errstr, $errfile, $errline)
    {
        if (!(error_reporting() & $errno)) {
            return false;
        }

        self::handleException(new ErrorException($errstr, 0, $errno, $errfile, $errline));
    }
}
