<?php

require_once __DIR__ . '/../Repositories/NotificationRepository.php';
require_once __DIR__ . '/../core/Database.php';

class NotificationService
{
    private $repo;
    private $db;

    public function __construct()
    {
        $this->repo = new NotificationRepository();
        $this->db   = Database::getInstance()->getConnection();
    }

    /*
    ========================================
    BASIC SEND (OLD SAFE)
    ========================================
    */
    public function send($user_id, $message)
    {
        if (!$user_id || !$message)
        {
            return false;
        }

        return $this->repo->create(
            $user_id,
            $message
        );
    }

    /*
    ========================================
    NEW: SAFE AUTOMATIC NOTIFICATION HELPERS
    ========================================
    */

    public function notifyApplicationSubmitted($studentId, $applicationId)
    {
        $message = "Your application #{$applicationId} has been submitted.";
        return $this->send($studentId, $message);
    }

    public function notifyClerkApproved($studentId, $applicationId)
    {
        $message = "Your application #{$applicationId} has been approved by Clerk.";
        return $this->send($studentId, $message);
    }

    public function notifyHodApproved($studentId, $applicationId)
    {
        $message = "Your application #{$applicationId} has been approved by HOD.";
        return $this->send($studentId, $message);
    }

    public function notifyPrincipalApproved($studentId, $applicationId)
    {
        $message = "Your application #{$applicationId} has been approved by Principal.";
        return $this->send($studentId, $message);
    }

    public function notifyCertificateGenerated($studentId, $certificateNumber)
    {
        $message = "Your certificate {$certificateNumber} has been generated.";
        return $this->send($studentId, $message);
    }

    /*
    ========================================
    GET USER NOTIFICATIONS
    ========================================
    */
    public function getUserNotifications($user_id)
    {
        if (!$user_id)
        {
            return [];
        }

        return $this->repo->getByUser($user_id);
    }

    /*
    ========================================
    MARK AS READ
    ========================================
    */
    public function markAsRead($notification_id)
    {
        return $this->repo->markAsRead(
            $notification_id
        );
    }

    /*
    ========================================
    NEW: MARK ALL AS READ (SAFE)
    ========================================
    */
    public function markAllAsRead($user_id)
    {
        $stmt = $this->db->prepare("
            UPDATE notifications
            SET is_read = TRUE,
                read_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ");

        return $stmt->execute([$user_id]);
    }
    public function getUnreadCount($user_id)
{
    if (!$user_id)
        return 0;

    return $this->repo->getUnreadCount($user_id);
}

}