<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/Response.php';

class AdminLogsController extends Controller
{
    public function index()
    {
        AuthMiddleware::requireAdmin();

        try {
            // Safe: read directly from log file, no LogRepository needed
            $logPath = dirname(__DIR__, 2) . "/storage/logs/app.log";

            if (!file_exists($logPath)) {
                Response::json([
                    "success" => true,
                    "data"    => []
                ]);
                return;
            }

            $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $lines = array_reverse(array_slice($lines ?: [], -200)); // last 200 lines, newest first

            Response::json([
                "success" => true,
                "data"    => $lines
            ]);

        } catch (Exception $e) {
            Response::json([
                "success" => true,
                "data"    => [],
                "note"    => "Log read failed: " . $e->getMessage()
            ]);
        }
    }
}