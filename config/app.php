<?php
if (!defined('STORAGE_PATH')) {
    define('STORAGE_PATH', dirname(__DIR__) . '//storage');
}

return [

    // ========================================
    // APP SETTINGS
    // ========================================

    "app_name" => "College Portal",
    

    "base_url" => Config::get("APP_URL", "http://localhost/college%20portal/public"),

    "timezone" => "Asia/Kolkata",


    // ========================================
    // STORAGE PATHS
    // ========================================

    "storage_path" =>
        dirname(__DIR__) . "/public/storage/",

    "certificate_path" =>
        dirname(__DIR__) . "/public/storage/generated/",

    "upload_path" =>
        dirname(__DIR__) . "/public/storage/uploads/",


    // ========================================
    // DEBUG
    // ========================================

    "debug" => true

    

];