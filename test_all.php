<?php
$dsn = "pgsql:host=localhost;port=5432;dbname=college_portal";
$user = "postgres";
$pass = "112006";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
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
            WHERE a.id = 218";
    $stmt = $pdo->query($sql);
    $app = $stmt->fetch(PDO::FETCH_ASSOC);
    print_r($app);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
