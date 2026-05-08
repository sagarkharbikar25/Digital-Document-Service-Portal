<?php

require_once __DIR__ . "/../core/Model.php";

class Notification extends Model
{

    /*
    ========================================
    CREATE NOTIFICATION (OLD SAFE SUPPORT)
    ========================================
    */
    public function create($user_id, $message, $title = null)
    {
        // fallback title for old phase compatibility
        if (!$title)
        {
            $title = "Notification";
        }

        $stmt = $this->db->prepare("
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                is_read,
                created_at
            )
            VALUES
            (
                :user_id,
                :title,
                :message,
                FALSE,
                NOW()
            )
        ");

        return $stmt->execute([
            ":user_id" => $user_id,
            ":title"   => $title,
            ":message" => $message
        ]);
    }


    /*
    ========================================
    GET USER NOTIFICATIONS
    ========================================
    */
    public function getByUser($user_id)
    {
        $stmt = $this->db->prepare("
            SELECT
                id,
                user_id,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        ");

        $stmt->execute([
            ":user_id" => $user_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /*
    ========================================
    GET UNREAD COUNT (NEW SAFE)
    ========================================
    */
    public function getUnreadCount($user_id)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total
            FROM notifications
            WHERE user_id = :user_id
            AND is_read = FALSE
        ");

        $stmt->execute([
            ":user_id" => $user_id
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int)$result['total'];
    }


    /*
    ========================================
    MARK ALL AS READ (NEW SAFE)
    ========================================
    */
    public function markAllAsRead($user_id)
    {
        $stmt = $this->db->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = :user_id
        ");

        return $stmt->execute([
            ":user_id" => $user_id
        ]);
    }

}