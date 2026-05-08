<?php

require_once __DIR__ . "/../core/Database.php";

class ApplicationNumberService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    ========================================
    GENERATE NUMBER (SAFE FORMATTER ONLY)
    ========================================
    */
    public function generate(int $applicationId): string
    {
        $year = date("Y");

        // Always 6 digits
        $number = str_pad($applicationId, 6, "0", STR_PAD_LEFT);

        return "APP-" . $year . "-" . $number;
    }

    /*
    ========================================
    ASSIGN NUMBER TO APPLICATION (SAFE)
    ========================================
    */
    public function assign(int $applicationId): string
    {
        // Check if already assigned (prevent overwrite)
        $check = $this->db->prepare("
            SELECT application_number
            FROM applications
            WHERE id = :id
        ");

        $check->execute([
            ":id" => $applicationId
        ]);

        $existing = $check->fetchColumn();

        if (!empty($existing)) {
            return $existing; // Do not regenerate
        }

        // Generate new number
        $number = $this->generate($applicationId);

        $stmt = $this->db->prepare("
            UPDATE applications
            SET application_number = :number
            WHERE id = :id
        ");

        $stmt->execute([
            ":number" => $number,
            ":id"     => $applicationId
        ]);

        return $number;
    }
}