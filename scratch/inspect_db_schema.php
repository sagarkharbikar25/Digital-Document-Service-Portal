<?php
try {
    $db = new PDO("pgsql:host=localhost;port=5432;dbname=college_portal", "postgres", "112006");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    foreach (['users', 'students'] as $table) {
        echo "TABLE: $table\n";
        $stmt = $db->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '$table'");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  - {$row['column_name']} ({$row['data_type']})\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
