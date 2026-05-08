<?php

require_once __DIR__ . "/../core/Session.php";
require_once __DIR__ . "/../helpers/response.php";

class RoleMiddleware
{

    // =====================================
    // HANDLE MULTIPLE ROLES
    // =====================================
    public static function handle($allowedRoles = [])
    {
        Session::start();

        $userRole = self::current();

        if (!$userRole) {
            Response::json([
                "success" => false,
                "message" => "Unauthorized. No role found."
            ], 401);
            exit;
        }

        if (!in_array($userRole, $allowedRoles)) {
            Response::json([
                "success" => false,
                "message" => "Forbidden. Access denied."
            ], 403);
            exit;
        }
    }


    // =====================================
    // REQUIRE SINGLE ROLE
    // =====================================
    public static function require($role)
    {
        self::handle([$role]);
    }


    // =====================================
    // GET CURRENT ROLE
    // =====================================
    public static function current()
    {
        Session::start();

        return $_SESSION["role"]
            ?? $_SESSION["user"]["role"]
            ?? null;
    }


    // =====================================
    // ADMIN GROUP CHECK
    // =====================================
    public static function adminOnly()
    {
        self::handle([
            "admin",
            "clerk",
            "hod",
            "principal"
        ]);
    }


    // =====================================
    // ✅ NEW: STUDENT OR ADMIN (any auth)
    // =====================================
    public static function anyAuthenticated()
    {
        Session::start();

        $role = self::current();

        if (!$role) {
            Response::json([
                "success" => false,
                "message" => "Unauthorized. Please login."
            ], 401);
            exit;
        }
    }


    // =====================================
    // ✅ NEW: CHECK ROLE WITHOUT BLOCKING
    // =====================================
    public static function is($role): bool
    {
        Session::start();
        return self::current() === $role;
    }

}