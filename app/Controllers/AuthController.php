<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../Services/AuthService.php';
require_once __DIR__ . '/../Services/EmailService.php';
require_once __DIR__ . '/../core/Session.php';
require_once __DIR__ . '/../core/Csrf.php';

class AuthController extends Controller
{
    private AuthService $authService;

    // Admin roles — skip OTP, go straight to session
    // All lowercase — must match what we store in session
    private array $adminRoles = ['admin', 'clerk', 'hod', 'principal'];

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    // ========================================
    // REGISTER  (students only)
    // ========================================
    public function register()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                echo json_encode(["success" => false, "message" => "Invalid JSON"]);
                return;
            }

            $result = $this->authService->register($data);

            if (isset($result['error']) && $result['error']) {
                echo json_encode(["success" => false, "message" => $result['message']]);
                return;
            }

            // Always send OTP on register (students only reach this)
            $this->authService->generateOTP($data['email']);

            echo json_encode([
                "success" => true,
                "message" => "Registration successful. OTP sent.",
                "user_id" => $result['user_id']
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    // ========================================
    // LOGIN
    // Only email + password — no role param
    // Admin  → direct session (no OTP)
    // Student → OTP required
    // ========================================
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode(["status" => "error", "message" => "Invalid input"]);
            return;
        }

        $result = $this->authService->login(
            $data['email']    ?? '',
            $data['password'] ?? ''
        );

        if (isset($result['error']) && $result['error']) {
            echo json_encode(["status" => "error", "message" => $result['message']]);
            return;
        }

        $user = $result['user'];

        // ── CRITICAL FIX: normalize role to lowercase BEFORE any check ──
        // DB may store "Clerk", "HOD", "Principal" — hasRole() uses lowercase
        // So we must always store lowercase in session
        $user['role'] = strtolower(trim($user['role'] ?? 'student'));

        // ── ADMIN: skip OTP, set session, return success ──
        if (in_array($user['role'], $this->adminRoles)) {
            Session::set("user_id", $user['id']);
            Session::set("role",    $user['role']);   // lowercase always
            Session::set("user",    $user);

            echo json_encode([
                "status"  => "success",
                "message" => "Login successful",
                "user"    => $user
            ]);
            return;
        }

        // ── STUDENT: send OTP ──
        Session::set("otp_user", $user['email']);
        $this->authService->generateOTP($user['email']);

        echo json_encode([
            "status"  => "otp_required",
            "message" => "OTP sent to your email",
            "email"   => $user['email']
        ]);
    }

    // ========================================
    // VERIFY OTP  (students only)
    // ========================================
    public function verifyOtp()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode(["status" => "error", "message" => "Invalid input"]);
            return;
        }

        $email = $data['email'] ?? '';
        $otp   = $data['otp']   ?? '';

        if (!$email || !$otp) {
            echo json_encode(["status" => "error", "message" => "Email and OTP required"]);
            return;
        }

        $result = $this->authService->verifyOTP($email, $otp);

        if (!isset($result['success']) || !$result['success']) {
            echo json_encode(["status" => "error", "message" => $result['message']]);
            return;
        }

        $user = $result['user'];

        // Normalize role to lowercase here too
        $user['role'] = strtolower(trim($user['role'] ?? 'student'));

        Session::set("user_id", $user['id']);
        Session::set("role",    $user['role']);
        Session::set("user",    $user);
        Session::remove("otp_user");

        echo json_encode([
            "status"  => "success",
            "message" => "Login successful",
            "user"    => $user
        ]);
    }

    // ========================================
    // CHANGE PASSWORD
    // ========================================
    public function changePassword()
    {
        $user_id = Session::get("user_id");

        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "Not logged in"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode(["status" => "error", "message" => "Invalid input"]);
            return;
        }

        $current = $data['current_password'] ?? null;
        $new     = $data['new_password']     ?? null;

        if (!$current || !$new) {
            echo json_encode(["status" => "error", "message" => "Current and new password required"]);
            return;
        }

        echo json_encode($this->authService->changePassword($user_id, $current, $new));
    }

    // ========================================
    // LOGOUT
    // ========================================
    public function logout()
    {
        Session::destroy();
        echo json_encode(["status" => "success", "message" => "Logged out"]);
    }

    // ========================================
    // GET CURRENT USER  (/api/auth/me)
    // ========================================
    public function me()
    {
        try {
            Session::start();

            if (empty($_SESSION['user'])) {
                echo json_encode(["success" => false, "message" => "Not logged in"]);
                return;
            }

            echo json_encode(["success" => true, "data" => $_SESSION['user']]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function csrf()
    {
        echo json_encode(["csrf_token" => Csrf::getToken()]);
    }
}