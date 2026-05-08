<?php

require_once __DIR__ . '/../core/Database.php';

class CertificateRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    =====================================
    EXISTING FUNCTION (KEEP)
    Create Certificate

    FIXED: certificate_file → file_path
           created_at       → generated_at
    (confirmed from 005_create_certificates migration)
    =====================================
    */
    public function create($data)
    {
        $sql = "
            INSERT INTO certificates (
                application_id,
                certificate_number,
                file_path,
                generated_at
            )
            VALUES (
                :application_id,
                :certificate_number,
                :file_path,
                NOW()
            )
            RETURNING id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'application_id'     => $data['application_id'],
            'certificate_number' => $data['certificate_number'],
            'file_path'          => $data['file_path'] ?? $data['certificate_file'] ?? ''
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    EXISTING FUNCTION (KEEP)
    Get Student Certificates
    =====================================
    */
    public function getByStudentId($studentId)
    {
        $sql = "
            SELECT *
            FROM certificates
            WHERE application_id IN (
                SELECT id FROM applications WHERE student_id = :student_id
            )
            ORDER BY generated_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    EXISTING FUNCTION (KEEP)
    Download Certificate
    =====================================
    */
    public function getByCertificateNumber($certificateNumber)
    {
        $sql = "
            SELECT *
            FROM certificates
            WHERE certificate_number = :certificate_number
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['certificate_number' => $certificateNumber]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    EXISTING FUNCTION (KEEP)
    Admin: Get all certificates with student info
    =====================================
    */
    public function getAllWithStudent()
    {
        $sql = "
            SELECT
                c.id,
                c.certificate_number,
                c.file_path,
                c.generated_at,
                c.application_id,
                u.id    AS student_id,
                u.name  AS student_name,
                u.email AS student_email
            FROM certificates c
            JOIN applications a ON c.application_id = a.id
            JOIN users u ON a.student_id = u.id
            ORDER BY c.generated_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    EXISTING FUNCTION (KEEP)
    Find by number (used internally)
    =====================================
    */
    public function findByNumber($certificateNumber)
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM certificates
            WHERE certificate_number = :certificate_number
            LIMIT 1
        ");

        $stmt->execute([':certificate_number' => $certificateNumber]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    NEW — findByCertificateNumber
    Alias for findByNumber
    =====================================
    */
    public function findByCertificateNumber($certificateNumber)
    {
        return $this->findByNumber($certificateNumber);
    }

    /*
    =====================================
    NEW — searchByCertificateNumber
    Search by cert number OR student name OR email
    =====================================
    */
    public function searchByCertificateNumber($query)
    {
        $like = '%' . $query . '%';

        $sql = "
            SELECT
                c.id,
                c.certificate_number,
                c.file_path,
                c.generated_at,
                c.application_id,
                u.id    AS student_id,
                u.name  AS student_name,
                u.email AS student_email
            FROM certificates c
            JOIN applications a ON c.application_id = a.id
            JOIN users u ON a.student_id = u.id
            WHERE
                c.certificate_number LIKE :query
                OR u.name            LIKE :query2
                OR u.email           LIKE :query3
            ORDER BY c.generated_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':query'  => $like,
            ':query2' => $like,
            ':query3' => $like,
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}