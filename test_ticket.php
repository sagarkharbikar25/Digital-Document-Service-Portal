<?php
// Mock script to test ApplicationController::create for support ticket
require 'app/core/Config.php';
require 'app/core/Database.php';

// I need to login as a student, ensure they have a profile, then POST to /application/create
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // find a student who has a profile
    $stmt = $pdo->query("SELECT u.id, u.email, s.bt_id FROM users u JOIN students s ON u.id = s.user_id LIMIT 1");
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        echo "No student with profile found.\n";
        exit;
    }
    
    echo "Found student: " . $student['email'] . " (BTID: " . $student['bt_id'] . ")\n";
    
    // start a session to mock login
    session_start();
    $_SESSION['user_id'] = $student['id'];
    $_SESSION['user'] = $student;
    
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST['admType'] = 'support_ticket';
    $_POST['purpose'] = '[technical] I cannot download my hallticket.';
    
    require 'app/Controllers/ApplicationController.php';
    
    $ctrl = new ApplicationController();
    $ctrl->create();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
