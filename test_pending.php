<?php
require 'app/core/Config.php';
require 'app/core/Database.php';
require 'app/Repositories/ApplicationRepository.php';

try {
    $repo = new ApplicationRepository();
    $data = $repo->getClerkPending('Information Technology');
    
    echo "Pending IT Apps:\n";
    print_r($data);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
