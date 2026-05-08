<?php
try {
    $db = new PDO("pgsql:host=localhost;port=5432;dbname=college_portal", "postgres", "112006");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $res = $db->query('SELECT DISTINCT branch FROM students WHERE branch IS NOT NULL AND branch != \'\'');
    $branches = [];
    while($row = $res->fetch(PDO::FETCH_ASSOC)) {
        $branches[] = $row['branch'];
    }
    echo "Branches in Students Table: " . implode(', ', $branches) . PHP_EOL;

} catch (PDOException $e) {
    echo "DB Error: " . $e->getMessage() . PHP_EOL;
}
