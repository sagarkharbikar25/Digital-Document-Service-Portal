<?php

require_once __DIR__ . '/../Services/NotificationService.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/Controller.php';

class NotificationController extends Controller
{
    private $service;

    public function __construct()
    {
        $this->service = new NotificationService();
    }

    /*
    =====================================
    GET USER NOTIFICATIONS
    =====================================
    */
    public function myNotifications()
    {
        $userId = Session::get('user_id');

        if (!$userId)
        {
            return $this->json([
                "success" => false,
                "message" => "Not logged in"
            ], 401);
        }

        $data = $this->service->getUserNotifications($userId);

        return $this->json([
            "success" => true,
            "data" => $data
        ]);
    }

    /*
    =====================================
    MARK AS READ
    =====================================
    */
    public function markRead()
    {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['notification_id']))
        {
            return $this->json([
                "success" => false,
                "message" => "notification_id required"
            ], 400);
        }

        $this->service->markAsRead($input['notification_id']);

        return $this->json([
            "success" => true,
            "message" => "Notification marked as read"
        ]);
    }
    public function unreadCount()
{
    $userId = Session::get('user_id');

    if (!$userId)
    {
        return $this->json([
            "success" => false,
            "message" => "Not logged in"
        ], 401);
    }

    $count = $this->service->getUnreadCount($userId);

    return $this->json([
        "success" => true,
        "data" => [
            "unread_count" => $count
        ]
    ]);
}

    /*
    =====================================
    MARK ALL AS READ
    =====================================
    */
    public function markAllRead()
    {
        $userId = Session::get('user_id');

        if (!$userId)
        {
            return $this->json([
                "success" => false,
                "message" => "Not logged in"
            ], 401);
        }

        $this->service->markAllAsRead($userId);

        return $this->json([
            "success" => true,
            "message" => "All notifications marked as read"
        ]);
    }
}