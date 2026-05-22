<?php
require_once 'app/core/Config.php';
require_once 'app/core/Database.php';
$db = Database::getInstance();
$conn = $db->getConnection();
$stmt = $conn->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
