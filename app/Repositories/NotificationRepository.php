<?php

require_once __DIR__ . "/../models/Notification.php";

class NotificationRepository
{
    private $model;

    public function __construct()
    {
        $this->model = new Notification();
    }


    public function create($user_id, $message)
    {
        return $this->model->create(
            $user_id,
            $message
        );
    }


    public function getByUser($user_id)
    {
        return $this->model->getByUser($user_id);
    }

    public function markAsRead($notification_id)
{
    $db = Database::getInstance()->getConnection();

    try {

        // Try with read_at column (new schema)
        $stmt = $db->prepare("
            UPDATE notifications
            SET is_read = TRUE,
                read_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");

        return $stmt->execute([
            ":id" => $notification_id
        ]);

    } catch (PDOException $e) {

        // fallback for old schema (no read_at column)
        $stmt = $db->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = :id
        ");

        return $stmt->execute([
            ":id" => $notification_id
        ]);
    }
}
public function getUnreadCount($user_id)
{
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = :user_id
        AND is_read = FALSE
    ");

    $stmt->execute([
        ":user_id" => $user_id
    ]);

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result['count'] ?? 0;
}

}