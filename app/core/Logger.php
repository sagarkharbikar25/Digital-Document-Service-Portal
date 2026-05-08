<?php

class Logger
{
    private static $logPath;

    public static function init()
    {
        self::$logPath = dirname(__DIR__, 2) . "/storage/logs";

        if (!is_dir(self::$logPath))
        {
            mkdir(self::$logPath, 0777, true);
        }
    }

    public static function error($message, $context = [])
    {
        self::init();

        $file = self::$logPath . "/app.log";

        $timestamp = date("Y-m-d H:i:s");

        $logEntry = "[" . $timestamp . "] ERROR: " . $message;

        if (!empty($context))
        {
            $logEntry .= " | Context: " . json_encode($context);
        }

        $logEntry .= PHP_EOL;

        file_put_contents($file, $logEntry, FILE_APPEND);
    }
}