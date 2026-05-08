<?php

require_once __DIR__ . "/../core/Model.php";

class Application extends Model
{

    public function getDB()
    {
        return $this->db;
    }

    public function getConnection()
    {
    return $this->db;
    }

    // CREATE APPLICATION
    public function create($student_id, $document_id, $purpose)
    {
    $stmt = $this->db->prepare("
        INSERT INTO applications
        (student_id, document_id, purpose, status, created_at, updated_at)
        VALUES (?, ?, ?, 'pending_clerk', NOW(), NOW())
    ");

    $stmt->execute([
        $student_id,
        $document_id,
        $purpose
    ]);

    return $this->db->lastInsertId();
    }


    // GET STUDENT APPLICATIONS
    public function getByStudent($student_id)
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM applications
            WHERE student_id = :student_id
            ORDER BY created_at DESC
        ");

        $stmt->execute([
            ":student_id" => $student_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // GET BY STATUS
    public function getByStatus($status)
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM applications
            WHERE status = :status
            ORDER BY created_at DESC
        ");

        $stmt->execute([
            ":status" => $status
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getClerkPending()
    {
    $stmt = $this->db->prepare("
        SELECT *
        FROM applications
        WHERE status = 'pending_clerk'
        AND clerk_id IS NULL
        ORDER BY created_at ASC
    ");

    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getHodPending()
    {
    $stmt = $this->db->prepare("
        SELECT *
        FROM applications
        WHERE status = 'pending_hod'
        AND clerk_id IS NOT NULL
        AND hod_id IS NULL
        ORDER BY created_at ASC
    ");

    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrincipalPending()
    {
    $stmt = $this->db->prepare("
        SELECT *
        FROM applications
        WHERE status = 'pending_principal'
        AND hod_id IS NOT NULL
        AND principal_id IS NULL
        ORDER BY created_at ASC
    ");

    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // APPROVALS

   public function clerkApprove($application_id, $clerk_id)
    {
    $sql = "
        UPDATE applications
        SET
            clerk_id = :clerk_id,
            clerk_approved_at = NOW(),
            status = 'pending_hod',
            updated_at = NOW()
        WHERE id = :application_id
    ";

    $stmt = $this->db->prepare($sql);

    return $stmt->execute([
        "clerk_id" => $clerk_id,
        "application_id" => $application_id
    ]);
    }


    public function hodApprove($application_id, $hod_id)
    {
    $sql = "
        UPDATE applications
        SET
            hod_id = :hod_id,
            hod_approved_at = NOW(),
            status = 'pending_principal',
            updated_at = NOW()
        WHERE id = :application_id
    ";

    $stmt = $this->db->prepare($sql);

    return $stmt->execute([
        "hod_id" => $hod_id,
        "application_id" => $application_id
    ]);
    }


   public function principalApprove($application_id, $principal_id)
    {
    $sql = "
        UPDATE applications
        SET
            principal_id = :principal_id,
            principal_approved_at = NOW(),
            status = 'completed',
            updated_at = NOW()
        WHERE id = :application_id
    ";

    $stmt = $this->db->prepare($sql);

    return $stmt->execute([
        "principal_id" => $principal_id,
        "application_id" => $application_id
    ]);
    }


    public function updateStatus($application_id, $status)
    {
        $stmt = $this->db->prepare("
            UPDATE applications
            SET status = :status
            WHERE id = :id
        ");

        return $stmt->execute([
            ":status" => $status,
            ":id" => $application_id
        ]);
    }


    // CERTIFICATE FILE SAVE

    public function saveCertificateFile($application_id, $file)
    {
        $stmt = $this->db->prepare("
            UPDATE applications
            SET certificate_file = :file
            WHERE id = :id
        ");

        return $stmt->execute([
            ":file" => $file,
            ":id" => $application_id
        ]);
    }


    // FULL APPLICATION DATA FOR CERTIFICATE
   public function getFullApplication($application_id)
    {
        $sql = "
        SELECT
            a.id,
            a.student_id,
            a.document_id,
            a.purpose,
            a.status,
            a.created_at,
            a.certificate_file,

            u.id as user_id,
            u.name as student_name,
            u.email,

            s.roll_number,
            s.department,
            s.year

        FROM applications a

        LEFT JOIN users u
            ON u.id = a.student_id

        LEFT JOIN students s
            ON s.user_id = u.id

        WHERE a.id = :id
        LIMIT 1
     ";

         $stmt = $this->db->prepare($sql);

        $stmt->execute([
        ":id" => $application_id
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result)
     {
        return null;
        }

        return $result;
    }

    public function getApplicationStatus($application_id)
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM applications
            WHERE id = :id
        ");

        $stmt->execute([
            ":id" => $application_id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

}