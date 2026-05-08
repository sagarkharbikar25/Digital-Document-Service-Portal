<?php

require_once __DIR__ . '/../app/core/Database.php';

$db = Database::getInstance()->getConnection();

$users = [
    ['Student User', 'student@jdcoem.ac.in', 'student'],
    ['HOD User', 'hod@jdcoem.ac.in', 'hod'],
    ['Principal User', 'principal@jdcoem.ac.in', 'principal']
];

foreach ($users as $u)
{
    $password = password_hash("123456", PASSWORD_DEFAULT);

    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, role)
        VALUES (:name, :email, :password, :role)
    ");

    $stmt->execute([
        ':name' => $u[0],
        ':email' => $u[1],
        ':password' => $password,
        ':role' => $u[2]
    ]);
}

echo "All users created";