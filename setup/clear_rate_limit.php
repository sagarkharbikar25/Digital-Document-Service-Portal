<?php
require_once __DIR__ . '/../app/core/Database.php';
try {
    $db = Database::getInstance()->getConnection();
    $db->exec("TRUNCATE TABLE api_requests");
    echo "Rate limit table cleared successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
