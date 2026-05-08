<?php

class LogRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function log($userId, $action, $entityType, $entityId)
    {
        $stmt = $this->db->prepare("
            INSERT INTO logs (user_id, action, entity_type, entity_id)
            VALUES (:user_id, :action, :entity_type, :entity_id)
        ");

        $stmt->execute([
            "user_id" => $userId,
            "action" => $action,
            "entity_type" => $entityType,
            "entity_id" => $entityId
        ]);
    }

    public function getAll()
    {
        $sql = "
        SELECT l.*, u.name
        FROM logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}