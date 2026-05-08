<?php
require_once __DIR__ . '/../Models/Staff.php';
require_once __DIR__ . '/../core/Database.php';class StaffRepository
{
    private $model;
    private $db;

    public function __construct()
    {
        $this->model = new Staff();

        // FIX: get PDO connection safely
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    =====================================
    EXISTING FUNCTION (RENAMED SAFE)
    =====================================
    */
    public function createStaff($user_id, $role)
    {
        return $this->model->create(
            $user_id,
            $role
        );
    }

    /*
    =====================================
    PHASE 5 FUNCTION
    =====================================
    */
    public function getAll()
    {
        $sql = "
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    =====================================
    PHASE 5 FUNCTION
    =====================================
    */
    public function create($data)
    {
        $sql = "
            INSERT INTO users (name, email, password, role)
            VALUES (:name, :email, :password, :role)
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            "name" => $data['name'],
            "email" => $data['email'],
            "password" => password_hash($data['password'], PASSWORD_BCRYPT),
            "role" => $data['role']
        ]);
    }

    /*
    =====================================
    PHASE 5 FUNCTION
    =====================================
    */
    public function delete($id)
    {
        $sql = "DELETE FROM users WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            "id" => $id
        ]);
    }

}