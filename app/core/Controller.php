<?php

require_once __DIR__ . "/Logger.php";

class Controller
{

    /*
    ========================================
    MAIN JSON RESPONSE (SAFE — BACKWARD COMPATIBLE)
    ========================================
    */
    protected function json($data = [], $status = 200)
    {
        http_response_code($status);

        // Standard response structure (keeps your old format)
        $response = [

            "success" => $data["success"] ?? ($status < 400),

            "message" => $data["message"] ?? null,

            "data" => array_key_exists("data", $data)
                ? $data["data"]
                : $this->extractData($data),

            "error" => $status >= 400
                ? ($data["error"] ?? $data["message"] ?? "ERROR")
                : null
        ];

        header("Content-Type: application/json");

        /*
        ========================================
        SAFE ERROR LOGGING (500+ only)
        ========================================
        */
        if ($status >= 500)
        {
            Logger::error(
                $response["message"] ?? "Unknown server error",
                [
                    "response" => $response,
                    "status" => $status,
                    "timestamp" => date("Y-m-d H:i:s"),
                    "ip" => $_SERVER['REMOTE_ADDR'] ?? null,
                    "uri" => $_SERVER['REQUEST_URI'] ?? null
                ]
            );
        }

        echo json_encode(
            $response,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

        exit;
    }


    /*
    ========================================
    NEW: SUCCESS HELPER (SAFE ADDITION)
    DOES NOT BREAK OLD CODE
    ========================================
    */
    protected function success($data = null, $message = null, $status = 200)
    {
        return $this->json([
            "success" => true,
            "message" => $message,
            "data" => $data
        ], $status);
    }


    /*
    ========================================
    NEW: ERROR HELPER (SAFE ADDITION)
    ========================================
    */
    protected function error($message = "Error", $status = 400, $extra = [])
    {
        return $this->json(array_merge([
            "success" => false,
            "message" => $message,
            "error" => true
        ], $extra), $status);
    }


    /*
    ========================================
    AUTOMATIC DATA EXTRACTION (UNCHANGED)
    ========================================
    */
    private function extractData($data)
    {
        $reserved = ["success", "message", "error"];

        $result = [];

        foreach ($data as $key => $value)
        {
            if (!in_array($key, $reserved))
            {
                $result[$key] = $value;
            }
        }

        return empty($result) ? null : $result;
    }


    /*
    ========================================
    NEW: SAFE INPUT READER
    ========================================
    */
    protected function input()
    {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        return $this->sanitize($data);
    }

    protected function sanitize($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitize($value);
            }
        } else {
            if (is_string($data)) {
                $data = trim(htmlspecialchars($data, ENT_QUOTES, 'UTF-8'));
            }
        }
        return $data;
    }

    protected function query($key, $default = null)
    {
        $val = $_GET[$key] ?? $default;
        return is_string($val) ? trim(htmlspecialchars($val, ENT_QUOTES, 'UTF-8')) : $val;
    }


    /*
    ========================================
    NEW: SAFE SESSION USER HELPER
    ========================================
    */
    protected function user()
    {
        return $_SESSION['user'] ?? null;
    }

}