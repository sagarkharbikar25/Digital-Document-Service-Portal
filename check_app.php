<?php
require 'app/core/Config.php';
require 'app/core/Database.php';
$stmt = Database::getInstance()->getConnection()->query("
    SELECT 
        a.id, 
        a.branch as a_branch, 
        s.department as s_dept, 
        s.branch as s_branch,
        COALESCE(a.branch, s.department, s.branch) as final_dept
    FROM applications a
    LEFT JOIN students s ON s.user_id = a.student_id
    WHERE a.id = 213 OR a.id = 212 OR a.id = 211 OR a.id = 210
    ORDER BY a.id DESC
");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
