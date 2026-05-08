<?php

require_once "../app/core/Database.php";

$db = Database::getInstance()->getConnection();

if ($db) {
    echo "DB CONNECTED SUCCESSFULLY";
} else {
    echo "DB FAILED";
}