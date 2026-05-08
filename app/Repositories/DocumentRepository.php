<?php

require_once __DIR__ . '/../core/Database.php';

class DocumentRepository
{
    private $db;

    public function __construct()
    {
        // Initialize database connection
        $this->db = Database::getInstance()->getConnection();
    }

    public function getByUserId($userId)
    {
        $stmt = $this->db->prepare("
            SELECT id, user_id, document_name, file_path, status, created_at
            FROM documents
            WHERE user_id = :user_id
            ORDER BY id DESC
        ");

        $stmt->execute([
            ':user_id' => $userId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}