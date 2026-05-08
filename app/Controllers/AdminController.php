<?php

require_once __DIR__ . '/../Services/AdminDashboardService.php';
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../core/Logger.php';

class AdminController extends Controller
{
    private $dashboardService;

    public function __construct()
    {
        // SAFE initialization
        $this->dashboardService = new AdminDashboardService();
    }

    /*
    ============================================
    ADMIN DASHBOARD STATS (ENHANCED SAFE)
    ============================================
    */
    public function dashboard()
    {
        try {

            // DO NOT REMOVE (old working security)
            AuthMiddleware::requireAdmin();

            $stats =
                $this->dashboardService
                     ->getDashboardStats();

            // Keep old response system intact
            return Response::json([
                "success" => true,
                "message" => null,
                "data" => $stats,
                "error" => null
            ]);

        }
        catch (Exception $e)
        {
            // SAFE logging
            Logger::error(
                "Admin dashboard failed",
                ["error" => $e->getMessage()]
            );

            return Response::json([
                "success" => false,
                "message" => "Failed to load dashboard",
                "data" => null,
                "error" => $e->getMessage()
            ], 500);
        }
    }
}