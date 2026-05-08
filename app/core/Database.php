<?php

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        try {

            $host = Config::get("DB_HOST", "localhost");
            $port = Config::get("DB_PORT", "5432");
            $dbname = Config::get("DB_NAME", "college_portal");
            $user = Config::get("DB_USERNAME", "postgres");
            $password = Config::get("DB_PASSWORD", "");

            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

            $this->connection = new PDO(
                $dsn,
                $user,
                $password
            );

            $this->connection->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

        } catch (PDOException $e) {

            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance == null) {

            self::$instance = new Database();
        }

        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }
}