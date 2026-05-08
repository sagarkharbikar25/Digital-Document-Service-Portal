<?php

require_once __DIR__ . "/constants.php";


// ========================================
// GET JSON INPUT
// ========================================

function getJsonInput()
{
    return json_decode(
        file_get_contents("php://input"),
        true
    );
}


// ========================================
// GENERATE RANDOM STRING
// ========================================

function generateRandomString($length = 20)
{
    return bin2hex(random_bytes($length / 2));
}


// ========================================
// STORAGE PATH HELPERS
// ========================================

function storagePath($path = "")
{
    return STORAGE_PATH . $path;
}

function certificatePath($file)
{
    return CERTIFICATE_PATH . $file;
}


// ========================================
// FILE EXISTS HELPER
// ========================================

function fileExistsSafe($path)
{
    return file_exists($path) && is_file($path);
}


// ========================================
// GET CURRENT DATE
// ========================================

function now()
{
    return date("Y-m-d H:i:s");
}