<?php

class AdminApplicationService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getApplications($filters)
    {
        $sql = "
            SELECT a.*, u.name as student_name
            FROM applications a
            JOIN users u ON u.id = a.student_id
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND a.status = :status";
            $params['status'] = $filters['status'];
        }

        $sql .= " ORDER BY a.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }
}