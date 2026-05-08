<?php

class RateLimiter
{
    private $db;
    private $limit = 60; // Max requests
    private $window = 60; // Time window in seconds

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function check($ip, $endpoint)
    {
        try {
            // Delete old requests outside the window
            $stmt = $this->db->prepare("DELETE FROM api_requests WHERE requested_at < (NOW() - INTERVAL '60 seconds')");
            $stmt->execute();

            // Count requests from this IP in the last window
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM api_requests WHERE ip_address = :ip AND requested_at > (NOW() - INTERVAL '60 seconds')");
            $stmt->execute([':ip' => $ip]);
            $count = $stmt->fetchColumn();

            if ($count >= $this->limit) {
                return false;
            }

            // Record this request
            $stmt = $this->db->prepare("INSERT INTO api_requests (ip_address, endpoint) VALUES (:ip, :endpoint)");
            $stmt->execute([':ip' => $ip, ':endpoint' => $endpoint]);

            return true;
        } catch (Exception $e) {
            // Self-healing: if table is missing, create it
            if (strpos($e->getMessage(), 'relation "api_requests" does not exist') !== false) {
                $this->createTable();
                return true; // allow the request this time
            }
            error_log("RateLimiter Error: " . $e->getMessage());
            return true; // Don't block users if security check fails internally
        }
    }

    private function createTable()
    {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS api_requests (
                id SERIAL PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                endpoint VARCHAR(255) NOT NULL,
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_ip_time ON api_requests (ip_address, requested_at);";
            $this->db->exec($sql);
        } catch (Exception $e) {
            error_log("Failed to create api_requests table: " . $e->getMessage());
        }
    }
}
