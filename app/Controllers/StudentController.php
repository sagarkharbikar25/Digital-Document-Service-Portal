<?php

require_once __DIR__ . "/../Repositories/StudentRepository.php";
require_once __DIR__ . "/../core/Session.php";

class StudentController
{
    private $repo;

    public function __construct()
    {
        Session::start(); // REQUIRED
        $this->repo = new StudentRepository();
    }

    // =====================================
    // EXISTING PHASE - CREATE PROFILE
    // DO NOT BREAK
    // =====================================
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data)
        {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid input"
            ]);
            return;
        }

        // SAFE call existing repository method
        $result = $this->repo->create(
            $data["user_id"],
            $data["roll_no"],
            $data["branch"],
            $data["year"],
            $data["phone"]
        );

        echo json_encode([
            "status" => "success",
            "data" => $result
        ]);
    }


    // =====================================
    // EXISTING PHASE - PROFILE
    // =====================================
    public function profile()
    {
        // Use session first (secure)
        $user_id = Session::get("user_id");

        // fallback for old system
        if (!$user_id && isset($_GET["user_id"]))
        {
            $user_id = $_GET["user_id"];
        }

        if (!$user_id)
        {
            http_response_code(401);

            echo json_encode([
                "status" => "error",
                "message" => "Unauthorized"
            ]);

            return;
        }

        $student = $this->repo->findByUserId($user_id);

        echo json_encode([
            "status" => "success",
            "data" => $student
        ]);
    }


    // =====================================
    // NEW PHASE - DASHBOARD
    // =====================================
    public function dashboard()
    {
        $user_id = Session::get("user_id");

        if (!$user_id)
        {
            http_response_code(401);

            echo json_encode([
                "status" => "error",
                "message" => "Unauthorized"
            ]);

            return;
        }

        require_once __DIR__ . "/../Services/StudentService.php";

        $service = new StudentService();

        $stats = $service->getDashboardStats($user_id);

        echo json_encode([
            "status" => "success",
            "data" => $stats
        ]);
    }

    public function certificates()
    {   
        $studentId = Session::get('user_id');

        if (!$studentId)
        {
        http_response_code(401);

        echo json_encode([
            "status" => "error",
            "message" => "Unauthorized"
        ]);

        return;
        }

        require_once __DIR__ . '/../Services/StudentService.php';

        $service = new StudentService();

        $certificates = $service->getCertificates($studentId);

        echo json_encode([
        "status" => "success",
        "data" => $certificates
        ]);
    }
}