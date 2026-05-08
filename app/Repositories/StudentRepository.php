<?php

require_once __DIR__ . '/../core/Database.php';

class StudentRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    // =====================================
    // CREATE STUDENT PROFILE
    // (Used by StudentController::create)
    // =====================================
    public function create($user_id, $roll_no, $branch, $year, $phone, $bt_id = null)
    {
        $stmt = $this->db->prepare("
        INSERT INTO students
        (user_id, roll_number, department, branch, year, current_year, phone, bt_id)
        VALUES
        (:user_id, :roll_number, :department, :branch, :year, :current_year, :phone, :bt_id)
        ");

        return $stmt->execute([
            ':user_id'      => $user_id,
            ':roll_number'  => $roll_no,
            ':department'   => $branch,
            ':branch'       => $branch,
            ':year'         => $year,
            ':current_year' => $year,
            ':phone'        => $phone,
            ':bt_id'        => $bt_id
        ]);
    }


    // =====================================
    // FIND STUDENT BY USER ID
    // (Used by StudentController::profile)
    // =====================================
    public function findByUserId($user_id)
    {
        $stmt = $this->db->prepare("
        SELECT
            *
        FROM students
        WHERE user_id = :user_id
        LIMIT 1
        ");

        $stmt->execute([
            ':user_id' => $user_id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // =====================================
    // UPDATE STUDENT PROFILE
    // =====================================
    public function update($user_id, $data)
    {
        $fields = [];
        $params = [':user_id' => $user_id];

        $allowed = [
            'roll_number', 'department', 'branch', 'year', 'current_year',
            'phone', 'dob', 'address', 'bt_id', 'parent_name', 'parent_mobile',
            'category', 'semester', 'admission_year', 'section', 'prn',
            'current_programme'
        ];

        foreach ($data as $key => $val) {
            if (in_array($key, $allowed)) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }

        if (empty($fields)) return false;

        $sql = "UPDATE students SET " . implode(', ', $fields) . " WHERE user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }


    // =====================================
    // DASHBOARD STATS
    // (Your existing code — unchanged)
    // =====================================
    public function getDashboardStats($studentId)
{
    $stats = [];

    // Total applications
    $stmt = $this->db->prepare("
        SELECT COUNT(*) 
        FROM applications
        WHERE student_id = :student_id
    ");
    $stmt->execute(['student_id' => $studentId]);
    $stats['total_applications'] = (int)$stmt->fetchColumn();

    // Approved
    $stmt = $this->db->prepare("
        SELECT COUNT(*) 
        FROM applications
        WHERE student_id = :student_id 
        AND status = 'approved'
    ");
    $stmt->execute(['student_id' => $studentId]);
    $stats['approved'] = (int)$stmt->fetchColumn();

    // Pending (very important — match your actual status)
    $stmt = $this->db->prepare("
        SELECT COUNT(*) 
        FROM applications
        WHERE student_id = :student_id 
        AND status LIKE 'pending%'
    ");
    $stmt->execute(['student_id' => $studentId]);
    $stats['pending'] = (int)$stmt->fetchColumn();

    // Rejected
    $stmt = $this->db->prepare("
        SELECT COUNT(*) 
        FROM applications
        WHERE student_id = :student_id 
        AND status = 'rejected'
    ");
    $stmt->execute(['student_id' => $studentId]);
    $stats['rejected'] = (int)$stmt->fetchColumn();

    // Certificates (IMPORTANT FIX)
    $stmt = $this->db->prepare("
        SELECT COUNT(*) 
        FROM certificates c
        JOIN applications a ON c.application_id = a.id
        WHERE a.student_id = :student_id
    ");
    $stmt->execute(['student_id' => $studentId]);
    $stats['certificates'] = (int)$stmt->fetchColumn();

    return $stats;
}
    // =====================================
    // GET STUDENT CERTIFICATES
    // =====================================
    public function getCertificates($studentId)
{
    $stmt = $this->db->prepare("
        SELECT
            c.certificate_number,
            c.application_id,
            c.file_path,
            c.generated_at
        FROM certificates c
        JOIN applications a ON c.application_id = a.id
        WHERE a.student_id = :student_id
        ORDER BY c.id DESC
    ");

    $stmt->execute([
        ':student_id' => $studentId
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
}