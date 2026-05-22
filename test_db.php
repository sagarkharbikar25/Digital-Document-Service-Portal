<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Check IT Clerk details
    $stmt = $pdo->query("SELECT id, name, department, email FROM users WHERE email='itclerk@jdcoem.ac.in'");
    $clerk = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "IT Clerk:\n";
    print_r($clerk);
    
    // Check APP 213
    $stmt2 = $pdo->query("
        SELECT 
            a.id as app_id,
            a.status,
            a.branch as a_branch,
            s.department as s_department,
            s.branch as s_branch,
            COALESCE(a.branch, s.department, s.branch) as coalesced_dept
        FROM applications a
        LEFT JOIN students s ON s.user_id = a.student_id
        WHERE a.id = 213
    ");
    $app = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo "\nApp 213:\n";
    print_r($app);

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
