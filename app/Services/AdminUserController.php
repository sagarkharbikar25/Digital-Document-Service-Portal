<?php

class AdminUserController extends Controller
{
    private $service;

    public function __construct()
    {
        $this->service = new AdminUserService();
    }

    public function index()
    {
        AuthMiddleware::requireAdmin();

        $users = $this->service->getAllUsers();

        Response::json([
            "success" => true,
            "data" => $users
        ]);
    }

    public function create()
    {
        AuthMiddleware::requireAdmin();

        $data = json_decode(file_get_contents("php://input"), true);

        $this->service->createUser($data);

        Response::json([
            "success" => true,
            "message" => "User created"
        ]);
    }

    public function delete()
    {
        AuthMiddleware::requireAdmin();

        $id = $_GET['id'];

        $this->service->deleteUser($id);

        Response::json([
            "success" => true,
            "message" => "User deleted"
        ]);
    }
}