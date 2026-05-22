<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Dumping first 5 applications:\n";
    $stmt = $db->query("SELECT * FROM applications LIMIT 5");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($rows)) {
        echo "No applications found in the table.\n";
    } else {
        print_r($rows);
    }
    
    echo "\nChecking schema of applications table:\n";
    $stmt = $db->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'applications'");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
