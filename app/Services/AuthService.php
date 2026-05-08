<?php

require_once __DIR__ . '/../Repositories/UserRepository.php';
require_once __DIR__ . '/../Repositories/StudentRepository.php';
require_once __DIR__ . '/../core/Database.php';
require_once BASE_PATH . '/app/Services/EmailService.php';

class AuthService
{
    private UserRepository $userRepository;
    private StudentRepository $studentRepository;
    private PDO $db;

    private string $allowedDomain = "@jdcoem.ac.in";

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->studentRepository = new StudentRepository();
        $database = Database::getInstance();
        $this->db = $database->getConnection();
    }

    private function isValidDomain(string $email): bool
    {
        return str_ends_with(strtolower($email), $this->allowedDomain);
    }

    // ========================================
    // LOGIN
    // ========================================
    public function login($email, $password)
    {
        if (!$this->isValidDomain($email)) {
            return ["error" => true, "message" => "Only college email allowed"];
        }

        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            return ["error" => true, "message" => "User not found"];
        }

        if (!password_verify($password, $user['password'])) {
            return ["error" => true, "message" => "Invalid password"];
        }

        // ── CRITICAL FIX: normalize role to lowercase HERE at the source ──
        // DB stores "Clerk", "HOD", "Principal" — normalize before anything else
        $user['role'] = strtolower(trim($user['role'] ?? 'student'));

        return ["error" => false, "user" => $user];
    }

    // ========================================
    // REGISTER USER
    // ========================================
    public function register(array $data): array
    {
        try {
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                return ["error" => true, "message" => "Name, email and password required"];
            }

            $data['email'] = strtolower(trim($data['email']));

            if (!str_ends_with($data['email'], '@jdcoem.ac.in')) {
                return ["error" => true, "message" => "Only JDCOEM email (@jdcoem.ac.in) allowed"];
            }

            if (strlen($data['password']) < 6) {
                return ["error" => true, "message" => "Password must be at least 6 characters"];
            }

            if (empty($data['role'])) {
                $data['role'] = "student";
            }

            $userId = $this->userRepository->create($data);

            // If it's a student registration, create their profile record automatically
            if ($data['role'] === 'student') {
                $this->studentRepository->create(
                    $userId,
                    $data['bt_id'] ?? '',   // roll_no fallback to btid
                    $data['branch'] ?? '',
                    $data['year'] ?? '',
                    $data['mobile'] ?? '',
                    $data['bt_id'] ?? ''
                );
            }

            $this->generateOTP($data['email']);

            return ["success" => true, "user_id" => $userId, "message" => "Registration successful. OTP sent."];

        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    // ========================================
    // GENERATE OTP
    // ========================================
    public function generateOTP(string $email): bool
    {
        $otp = rand(100000, 999999);

        $stmt = $this->db->prepare("
            INSERT INTO user_otps (email, otp, expires_at)
            VALUES (:email, :otp, CURRENT_TIMESTAMP + INTERVAL '5 minutes')
        ");
        $stmt->execute(['email' => $email, 'otp' => $otp]);

        require_once BASE_PATH . '/app/Services/EmailService.php';
        EmailService::sendOTP($email, $otp);

        return true;
    }

    // ========================================
    // VERIFY OTP
    // ========================================
    public function verifyOTP(string $email, string $otp): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM user_otps
            WHERE email = :email
            AND otp = :otp
            AND expires_at >= CURRENT_TIMESTAMP
            LIMIT 1
        ");
        $stmt->execute(['email' => trim($email), 'otp' => trim($otp)]);
        $otpRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$otpRow) {
            return ["success" => false, "message" => "Invalid or expired OTP"];
        }

        $stmt = $this->db->prepare("DELETE FROM user_otps WHERE email = :email");
        $stmt->execute(['email' => $email]);

        $user = $this->userRepository->findByEmail($email);

        // Normalize role here too
        $user['role'] = strtolower(trim($user['role'] ?? 'student'));

        return ["success" => true, "user" => $user];
    }

    // ========================================
    // CHANGE PASSWORD
    // ========================================
    public function changePassword($user_id, $current_password, $new_password)
    {
        $stmt = $this->db->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute(['id' => $user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            return ["status" => "error", "message" => "User not found"];
        }

        if (!password_verify($current_password, $user['password'])) {
            return ["status" => "error", "message" => "Current password incorrect"];
        }

        $newHash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->execute(['password' => $newHash, 'id' => $user_id]);

        return ["status" => "success", "message" => "Password changed successfully"];
    }
}