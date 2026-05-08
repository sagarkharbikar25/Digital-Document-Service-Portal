<?php
/**
 * Permissions Fix Script
 * Run this if you are getting "Access Denied" or "Could not write" errors in storage.
 */

$baseDir = __DIR__ . '/..';
$storageDir = $baseDir . '/storage';

echo "Checking permissions for $storageDir...\n";

if (!is_dir($storageDir)) {
    die("Storage directory not found!\n");
}

function fixPermissions($path) {
    echo "Processing: $path\n";
    if (is_dir($path)) {
        chmod($path, 0777);
        $files = scandir($path);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            fixPermissions($path . '/' . $file);
        }
    } else {
        chmod($path, 0666);
    }
}

fixPermissions($storageDir);

echo "\nPermissions fix complete. If you are on Linux, also consider running:\n";
echo "sudo chown -R www-data:www-data storage/\n";
