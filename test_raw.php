<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $department = "Information Technology";
    
    $sql = "
            SELECT
                a.*,
                COALESCE(u.name,  'Unknown')                       AS student_name,
                COALESCE(u.email, '')                              AS student_email,
                COALESCE(a.branch, s.department, s.branch, 'N/A') AS department,
                COALESCE(a.year,   s.current_year, s.year, '')     AS year,
                COALESCE(s.bt_id,  '')                             AS bt_id
            FROM applications a
            LEFT JOIN users    u ON u.id = a.student_id
            LEFT JOIN students s ON s.user_id = a.student_id
            WHERE a.status IN ('pending', 'pending_clerk')
            AND (COALESCE(a.branch, s.department, s.branch) = :dept) 
        ";
        
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':dept' => $department]);
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found: " . count($res) . "\n";
    print_r($res);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
