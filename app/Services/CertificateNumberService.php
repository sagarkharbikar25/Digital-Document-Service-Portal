<?php

require_once __DIR__ . "/../core/Database.php";

class CertificateNumberService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function generate()
    {
        $year = date("Y");

        /*
        ==========================================
        SUPPORT BOTH PHASES SAFELY
        Phase 2 → applications table
        Phase 5 → certificates table
        ==========================================
        */

        $queries = [

            // NEW phase (preferred)
            "
            SELECT certificate_number
            FROM certificates
            WHERE certificate_number LIKE 'CERT-$year-%'
            ORDER BY certificate_number DESC
            LIMIT 1
            ",

            // OLD phase fallback
            "
            SELECT certificate_number
            FROM applications
            WHERE certificate_number LIKE 'CERT-$year-%'
            ORDER BY certificate_number DESC
            LIMIT 1
            "
        ];

        $lastCertificate = null;

        foreach ($queries as $query)
        {
            try
            {
                $stmt = $this->db->query($query);

                $lastCertificate = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($lastCertificate)
                {
                    break;
                }
            }
            catch (Exception $e)
            {
                // ignore if table doesn't exist
            }
        }

        /*
        ==========================================
        GENERATE NEXT NUMBER SAFELY
        ==========================================
        */

        if (!$lastCertificate)
        {
            $nextNumber = 1;
        }
        else
        {
            $lastNumber = $lastCertificate['certificate_number'];

            preg_match('/(\d+)$/', $lastNumber, $matches);

            $nextNumber = isset($matches[1])
                ? ((int)$matches[1] + 1)
                : 1;
        }

        /*
        ==========================================
        FINAL FORMAT
        CERT-2026-000001
        ==========================================
        */

        return sprintf(
            "CERT-%s-%06d",
            $year,
            $nextNumber
        );
    }
}