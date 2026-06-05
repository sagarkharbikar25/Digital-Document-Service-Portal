<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    echo "USERS:\n";
    $stmt = $pdo->query("SELECT * FROM users WHERE id = 145");
    print_r($stmt->fetch(PDO::FETCH_ASSOC));
    
    echo "\nSTUDENTS:\n";
    $stmt = $pdo->query("SELECT * FROM students WHERE user_id = 145");
    print_r($stmt->fetch(PDO::FETCH_ASSOC));
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
