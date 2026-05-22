<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Adding 'department' column to 'users' table...\n";
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)");
    
    echo "Migration successful!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
