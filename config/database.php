<?php

class Database
{
    private $conn;

    public function connect()
    {
        if ($this->conn)
        {
            return $this->conn;
        }

        $config = require dirname(__DIR__,2)
            . "/config/database.php";

        try
        {
            $dsn =
                "pgsql:host={$config['host']};
                 port={$config['port']};
                 dbname={$config['dbname']}";

            $this->conn = new PDO(
                $dsn,
                $config["username"],
                $config["password"],
                [
                    PDO::ATTR_ERRMODE =>
                        PDO::ERRMODE_EXCEPTION,

                    PDO::ATTR_DEFAULT_FETCH_MODE =>
                        PDO::FETCH_ASSOC
                ]
            );

            return $this->conn;
        }
        catch (PDOException $e)
        {
            die(
                "Database connection failed: "
                . $e->getMessage()
            );
        }
    }
}