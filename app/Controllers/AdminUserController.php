<?php

require_once __DIR__ . '/../Services/AdminUserService.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';

class AdminUserController
{
    private $service;

    public function __construct()
    {
        $this->service = new AdminUserService();
    }

    /*
    ========================================
    GET ALL USERS
    ========================================
    */
    public function index()
    {
        AuthMiddleware::requireAdmin();

        $users = $this->service->getAllUsers();

        Response::json([
            "success" => true,
            "data" => $users
        ]);
    }

    /*
    ========================================
    CREATE USER
    ========================================
    */
    public function create()
    {
        AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents("php://input"), true);

        $this->service->createUser($data);

        Response::json([
            "success" => true,
            "message" => "User created successfully"
        ]);
    }

    /*
    ========================================
    DELETE USER
    ========================================
    */
    public function delete()
    {
        AuthMiddleware::requireAdmin();

        $id = $_GET['id'] ?? null;

        if (!$id)
        {
            Response::json([
                "success" => false,
                "message" => "User ID required"
            ], 400);
            return;
        }

        $this->service->deleteUser($id);

        Response::json([
            "success" => true,
            "message" => "User deleted successfully"
        ]);
    }
}