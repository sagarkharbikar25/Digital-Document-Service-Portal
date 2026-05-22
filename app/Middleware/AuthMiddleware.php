<?php

require_once __DIR__ . "/../core/Session.php";
require_once __DIR__ . "/../helpers/response.php";

class AuthMiddleware
{

    // =====================================
    // MAIN HANDLER (used in routes)
    // =====================================
    public static function handle()
    {
        Session::start();

        if (
            !isset($_SESSION["user_id"]) &&
            !isset($_SESSION["user"])
        ) {
            Response::json([
                "success" => false,
                "message" => "Unauthorized access. Please login."
            ], 401);
            exit;
        }
    }


    // =====================================
    // REQUIRE LOGIN (existing compatibility)
    // =====================================
    public static function requireLogin()
    {
        Session::start();

        if (
            !isset($_SESSION["user_id"]) &&
            !isset($_SESSION["user"])
        ) {
            Response::json([
                "success" => false,
                "message" => "Unauthorized"
            ], 401);
            exit;
        }
    }


    // =====================================
    // REQUIRE ADMIN (existing compatibility)
    // =====================================
    public static function requireAdmin()
    {
        Session::start();

        if (
            !isset($_SESSION["user"]) &&
            !isset($_SESSION["user_id"])
        ) {
            Response::json([
                "success" => false,
                "message" => "Unauthorized"
            ], 401);
            exit;
        }

        $role = $_SESSION["user"]["role"] ?? $_SESSION["role"] ?? null;
        $staffRoles = ["admin", "clerk", "hod", "principal"];

        if (!in_array($role, $staffRoles)) {
            Response::json([
                "success" => false,
                "message" => "Admin/Staff access required"
            ], 403);
            exit;
        }
    }


    // =====================================
    // REQUIRE STUDENT
    // =====================================
    public static function requireStudent()
    {
        Session::start();

        $role = $_SESSION["role"] ?? ($_SESSION["user"]["role"] ?? null);

        if ($role !== "student") {
            Response::json([
                "success" => false,
                "message" => "Student access required"
            ], 403);
            exit;
        }
    }


    // =====================================
    // REQUIRE ANY AUTHENTICATED USER
    // =====================================
    public static function user()
    {
        Session::start();

        if (isset($_SESSION["user"])) {
            return $_SESSION["user"];
        }

        return [
            "user_id" => $_SESSION["user_id"] ?? null,
            "role"    => $_SESSION["role"]    ?? null
        ];
    }


    // =====================================
    // ✅ NEW: CHECK IF LOGGED IN (bool)
    // =====================================
    public static function isLoggedIn(): bool
    {
        Session::start();
        return isset($_SESSION["user_id"]) || isset($_SESSION["user"]);
    }


    // =====================================
    // ✅ NEW: GET SESSION USER SAFELY
    // =====================================
    public static function getUser(): ?array
    {
        Session::start();

        if (isset($_SESSION["user"]) && is_array($_SESSION["user"])) {
            return $_SESSION["user"];
        }

        if (isset($_SESSION["user_id"])) {
            return [
                "id"   => $_SESSION["user_id"],
                "role" => $_SESSION["role"] ?? null
            ];
        }

        return null;
    }

}