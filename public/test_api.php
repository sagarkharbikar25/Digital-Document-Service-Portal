<?php
require __DIR__ . '/../app/core/Config.php';
require __DIR__ . '/../app/core/Database.php';
require __DIR__ . '/../app/core/Session.php';
require __DIR__ . '/../app/Repositories/ApplicationRepository.php';

Session::start();
Session::set("user", [
    "email" => "itclerk@jdcoem.ac.in",
    "name" => "Information Technology Clerk",
    "department" => "Information Technology",
    "role" => "clerk",
    "id" => 91
]);
Session::set("user_id", 91);
Session::set("role", "clerk");

$_SERVER['REQUEST_METHOD'] = 'GET';
require __DIR__ . '/../app/Controllers/ApplicationController.php';

$c = new ApplicationController();
// mock respond method to not exit
$c->pending();
