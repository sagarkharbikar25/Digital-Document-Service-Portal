<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $sql = "SELECT * FROM applications WHERE id = 218 OR application_number = 'APP-2026-000218'";
    $stmt = $pdo->query($sql);
    $app = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Application 218 in DB:\n";
    print_r($app);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
