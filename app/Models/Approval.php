<?php

require_once __DIR__ . "/../core/Model.php";

class Approval extends Model
{

    public function log($application_id, $staff_id, $role)
    {
        $stmt = $this->db->prepare("
            INSERT INTO approvals
            (application_id, staff_id, role, created_at)
            VALUES
            (:application_id, :staff_id, :role, NOW())
        ");

        return $stmt->execute([
            ":application_id" => $application_id,
            ":staff_id" => $staff_id,
            ":role" => $role
        ]);
    }

}