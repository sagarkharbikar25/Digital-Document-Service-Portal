<?php

require_once __DIR__ . '/../core/Database.php';

class ApprovalRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function clerkApprove($applicationId, $clerkId)
    {
        $sql = "
            UPDATE applications
            SET clerk_id = :clerk_id,
                clerk_approved_at = NOW(),
                status = 'clerk_approved'
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ":clerk_id" => $clerkId,
            ":id" => $applicationId
        ]);
    }

    public function hodApprove($applicationId, $hodId)
    {
        $sql = "
            UPDATE applications
            SET hod_id = :hod_id,
                hod_approved_at = NOW(),
                status = 'hod_approved'
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ":hod_id" => $hodId,
            ":id" => $applicationId
        ]);
    }

    public function principalApprove($applicationId, $principalId)
    {
        $sql = "
            UPDATE applications
            SET principal_id = :principal_id,
                principal_approved_at = NOW(),
                status = 'approved'
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ":principal_id" => $principalId,
            ":id" => $applicationId
        ]);
    }

}