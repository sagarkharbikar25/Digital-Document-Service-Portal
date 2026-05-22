<?php

require_once __DIR__ . '/../core/Database.php';

class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $database = Database::getInstance();

        if (!$database) {
            throw new Exception("Database instance failed");
        }

        $this->db = $database->getConnection();

        if (!$this->db) {
            throw new Exception("Database connection failed");
        }
    }


    /*
    ========================================
    FIND USER BY EMAIL
    ========================================
    */
    public function findByEmail(string $email): ?array
    {
        $sql = "
            SELECT
                u.id, u.name, u.email, u.password, u.role, u.department, u.created_at,
                s.bt_id,
                COALESCE(s.branch, s.department, 'Not specified') AS branch,
                COALESCE(s.current_year, s.year, 'Not specified') AS year,
                COALESCE(u.mobile, s.phone, '') AS mobile,
                COALESCE(u.dob, s.dob) AS dob,
                COALESCE(u.address, s.address) AS address,
                u.gender,
                s.current_programme AS programme,
                s.semester,
                s.admission_year,
                s.section,
                s.prn
            FROM users u
            LEFT JOIN students s ON s.user_id = u.id
            WHERE u.email = :email
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ":email" => $email
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }


    /*
    ========================================
    CREATE USER (SAFE + PRODUCTION READY)
    ========================================
    */
    public function create(array $data): int
    {
        try {

            // Prevent duplicate email BEFORE insert
            $existing = $this->findByEmail($data["email"]);

            if ($existing) {
                throw new Exception("Email already registered");
            }

            $sql = "
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role,
                    created_at
                )
                VALUES
                (
                    :name,
                    :email,
                    :password,
                    :role,
                    NOW()
                )
                RETURNING id
            ";

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                ":name" => $data["name"],
                ":email" => $data["email"],
                ":password" => password_hash(
                    $data["password"],
                    PASSWORD_DEFAULT
                ),
                ":role" => $data["role"] ?? "student"
            ]);

            return (int) $stmt->fetchColumn();

        }
        catch (PDOException $e)
        {
            // PostgreSQL duplicate error
            if ($e->getCode() == "23505") {
                throw new Exception("Email already registered");
            }

            throw new Exception("User creation failed");
        }
    }


    /*
    ========================================
    FIND USER BY ID
    ========================================
    */
    public function findById(int $id): ?array
    {
        $sql = "
            SELECT
                u.id, u.name, u.email, u.role, u.department, u.created_at,
                s.bt_id,
                COALESCE(s.branch, s.department, 'Not specified') AS branch,
                COALESCE(s.current_year, s.year, 'Not specified') AS year,
                COALESCE(u.mobile, s.phone, '') AS mobile,
                COALESCE(u.dob, s.dob) AS dob,
                COALESCE(u.address, s.address) AS address,
                u.gender,
                s.current_programme AS programme,
                s.semester,
                s.admission_year,
                s.section,
                s.prn
            FROM users u
            LEFT JOIN students s ON s.user_id = u.id
            WHERE u.id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ":id" => $id
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }


    /*
    ========================================
    GET USERS BY ROLE (CLERK/HOD/PRINCIPAL)
    ========================================
    */
    public function getByRole(string $role): array
    {
        $sql = "
            SELECT id, name, email, role, department, created_at
            FROM users
            WHERE role = :role
            ORDER BY created_at ASC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ":role" => $role
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}