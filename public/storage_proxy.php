<?php
/**
 * storage_proxy.php — Super-Intelligent Version
 * Serves files from the /storage/uploads/ folder.
 * Now includes recursive fallback search to handle deep student hierarchies.
 */
require_once __DIR__ . '/../app/core/Session.php';
Session::start();

// Simple security: only logged in users can see these files
if (!Session::get('user_id') && !Session::get('admin_id') && !Session::get('id')) {
    header("HTTP/1.1 403 Forbidden");
    exit("Access Denied");
}

$file = $_GET['file'] ?? '';
if (!$file) {
    header("HTTP/1.1 400 Bad Request");
    exit("No file specified");
}

// Sanitize path (prevent directory traversal)
$file = str_replace(['../', '..\\'], '', $file);
$fileNameOnly = basename($file);

$baseDir = realpath(__DIR__ . '/../storage/uploads');
$filePath = realpath($baseDir . '/' . $file);

/**
 * Recursive search function to find a file by name within a directory
 */
function findFileRecursive($dir, $targetFilename) {
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->getFilename() === $targetFilename) {
            return $file->getRealPath();
        }
    }
    return null;
}

// If direct path fails, search recursively for the filename
if (!$filePath || !is_file($filePath)) {
    $filePath = findFileRecursive($baseDir, $fileNameOnly);
}

// Verify file exists and is within the base directory
if ($filePath && strpos($filePath, $baseDir) === 0 && is_file($filePath)) {
    $mimeType = mime_content_type($filePath);
    
    // Set headers
    header("Content-Type: " . $mimeType);
    header("Content-Length: " . filesize($filePath));
    
    // Output file
    readfile($filePath);
    exit;
} else {
    header("HTTP/1.1 404 Not Found");
    echo "File not found: " . htmlspecialchars($file);
    exit;
}
