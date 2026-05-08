<?php
try {
    $db = new PDO("pgsql:host=localhost;port=5432;dbname=college_portal", "postgres", "112006");
    foreach (['users', 'students'] as $t) {
        echo "TABLE: $t\n";
        $q = $db->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '$t' ORDER BY ordinal_position");
        while($r = $q->fetch(PDO::FETCH_ASSOC)) {
            echo "  {$r['column_name']} ({$r['data_type']})\n";
        }
    }
} catch (Exception $e) { echo $e->getMessage(); }
