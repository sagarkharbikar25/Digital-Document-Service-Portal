<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $sql = "SELECT s.*, u.department AS user_department, u.name, u.email FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = 145 OR u.id = 145";
    $stmt = $pdo->query($sql);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Student 145 in DB:\n";
    print_r($student);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
