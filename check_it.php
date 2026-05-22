<?php
require 'app/core/Config.php';
require 'app/core/Database.php';
$stmt = Database::getInstance()->getConnection()->query("SELECT id, name, department FROM users WHERE email='itclerk@jdcoem.ac.in'");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
