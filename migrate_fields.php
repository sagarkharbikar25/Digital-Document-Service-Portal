<?php
require_once 'app/core/Config.php';
require_once 'app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Add columns to users if they don't exist
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100)");

    // Add columns to students if they don't exist
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS current_programme VARCHAR(100)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS semester VARCHAR(20)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_year VARCHAR(20)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(20)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS prn VARCHAR(50)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS bt_id VARCHAR(50)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS current_year VARCHAR(20)");
    $db->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(100)");

    echo "Migration successful.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
