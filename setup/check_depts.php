<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Distinct departments in students table:\n";
    $stmt = $db->query("SELECT DISTINCT department FROM students");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    echo "\nDistinct branches in applications table:\n";
    $stmt = $db->query("SELECT DISTINCT branch FROM applications");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
