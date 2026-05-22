<?php
require_once __DIR__ . '/../app/core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $users = [
        ['email' => 'saar@jdcoem.ac.in',  'role' => 'clerk',     'dept' => 'CS'],
        ['email' => 'skhod@jdcoem.ac.in', 'role' => 'hod',       'dept' => 'CS'],
        ['email' => 'sagar@jdcoem.ac.in', 'role' => 'principal', 'dept' => null]
    ];
    
    foreach ($users as $u) {
        echo "Updating/Checking user: " . $u['email'] . "\n";
        
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $u['email']]);
        $id = $stmt->fetchColumn();
        
        if ($id) {
            $stmt = $db->prepare("UPDATE users SET role = :role, department = :dept WHERE id = :id");
            $stmt->execute([
                'role' => $u['role'],
                'dept' => $u['dept'],
                'id'   => $id
            ]);
            echo " - User updated.\n";
        } else {
            // Create user with default password 'password123' if missing
            $stmt = $db->prepare("INSERT INTO users (name, email, password, role, department) VALUES (:name, :email, :pass, :role, :dept)");
            $stmt->execute([
                'name'  => ucfirst($u['role']),
                'email' => $u['email'],
                'pass'  => password_hash('password123', PASSWORD_DEFAULT),
                'role'  => $u['role'],
                'dept'  => $u['dept']
            ]);
            echo " - User created (Password: password123).\n";
        }
    }
    
    echo "\nSeed/Fix successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
