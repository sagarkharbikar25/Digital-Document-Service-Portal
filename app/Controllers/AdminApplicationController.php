<?php
require_once __DIR__ . '/../Services/AdminApplicationService.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/Response.php';
class AdminApplicationController extends Controller
{
    private $service;

    public function __construct()
    {
        $this->service = new AdminApplicationService();
    }

    public function index()
    {
        AuthMiddleware::requireAdmin();

        $filters = [
            "status" => $_GET['status'] ?? null
        ];

        $applications = $this->service->getApplications($filters);

        Response::json([
            "success" => true,
            "data" => $applications
        ]);
    }
}