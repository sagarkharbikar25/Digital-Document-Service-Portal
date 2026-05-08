<?php

// Prevent multiple loading
if (defined('CONSTANTS_LOADED')) {
    return;
}

define('CONSTANTS_LOADED', true);


// Base path
if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__, 2));
}


// App path
if (!defined('APP_PATH')) {
    define('APP_PATH', BASE_PATH . '/app');
}


// Public path
if (!defined('PUBLIC_PATH')) {
    define('PUBLIC_PATH', BASE_PATH . '/public');
}


// Storage path
if (!defined('STORAGE_PATH')) {
    define('STORAGE_PATH', BASE_PATH . '/storage');
}


// Certificate path
if (!defined('CERTIFICATE_PATH')) {
    define(
        'CERTIFICATE_PATH',
        BASE_PATH . '/public/storage/generated/'
    );
}