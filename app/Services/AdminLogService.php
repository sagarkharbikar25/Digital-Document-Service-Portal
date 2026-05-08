<?php

class AdminLogService
{
    private $logPath;

    public function __construct()
    {
        $this->logPath = dirname(__DIR__, 2) . "/storage/logs/app.log";
    }

    public function getAllLogs()
    {
        try {
            if (!file_exists($this->logPath)) {
                return [];
            }

            $lines = file($this->logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            return array_reverse(array_slice($lines ?: [], -200));

        } catch (Exception $e) {
            return [];
        }
    }
}