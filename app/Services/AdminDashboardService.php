<?php

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Logger.php';

class AdminDashboardService
{
    private $db;
    private $certificateDateColumn;

    public function __construct()
    {
        $database = Database::getInstance();

        if (!$database)
        {
            throw new Exception(
                "Database instance failed"
            );
        }

        $this->db =
            $database->getConnection();

        if (!$this->db)
        {
            throw new Exception(
                "Database connection failed"
            );
        }

        // SAFE auto detection
        $this->certificateDateColumn =
            $this->detectCertificateDateColumn();
    }

    /*
    ============================================
    GET DASHBOARD STATS (SAFE ENHANCED)
    ============================================
    */
    public function getDashboardStats()
    {
        try {

            return [

                "total_students" =>
                    $this->count(
                        "users",
                        "role='student'"
                    ),

                "total_applications" =>
                    $this->count("applications"),

                "pending_applications" =>
                    $this->count(
                        "applications",
                        "status='pending'"
                    ),

                "approved_applications" =>
                    $this->count(
                        "applications",
                        "status='approved'"
                    ),

                "rejected_applications" =>
                    $this->count(
                        "applications",
                        "status LIKE 'rejected%'"
                    ),

                "total_certificates" =>
                    $this->count("certificates"),

                "certificates_generated_today" =>
                    $this->count(
                        "certificates",
                        "DATE({$this->certificateDateColumn}) = CURRENT_DATE"
                    )

            ];

        }
        catch (Exception $e)
        {
            Logger::error(
                "Dashboard stats failed",
                ["error" => $e->getMessage()]
            );

            throw $e;
        }
    }

    /*
    ============================================
    SAFE COUNT FUNCTION
    ============================================
    */
    private function count($table, $condition = null)
    {
        try {

            $sql = "SELECT COUNT(*) AS count FROM {$table}";

            if ($condition)
            {
                $sql .= " WHERE {$condition}";
            }

            $stmt = $this->db->prepare($sql);

            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return (int)($result['count'] ?? 0);

        }
        catch (Exception $e)
        {
            Logger::error(
                "Count query failed",
                [
                    "table" => $table,
                    "error" => $e->getMessage()
                ]
            );

            return 0;
        }
    }

    /*
    ============================================
    DETECT CERTIFICATE DATE COLUMN SAFELY
    ============================================
    */
    private function detectCertificateDateColumn()
    {
        try {

            $sql = "
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'certificates'
                AND column_name IN ('generated_at','created_at')
                ORDER BY column_name DESC
                LIMIT 1
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute();

            $column = $stmt->fetchColumn();

            return $column ?: "generated_at";

        }
        catch (Exception $e)
        {
            Logger::error(
                "Certificate column detection failed",
                ["error" => $e->getMessage()]
            );

            return "generated_at";
        }
    }
}