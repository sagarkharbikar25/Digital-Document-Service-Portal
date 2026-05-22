<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Checking applications count...\n";
    $count = $db->query("SELECT COUNT(*) FROM applications")->fetchColumn();
    echo "Total applications: " . $count . "\n";
    
    echo "Checking users count...\n";
    $count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "Total users: " . $count . "\n";
    
    echo "Checking current user in session (if any)...\n";
    require_once __DIR__ . '/../app/core/Session.php';
    Session::start();
    $user = Session::get("user");
    print_r($user);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
