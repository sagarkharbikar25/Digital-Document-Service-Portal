<?php
// Session will be started after Config is loaded


// ========================================
// ERROR REPORTING (DEV ONLY)
// ========================================

error_reporting(E_ALL);
ini_set("display_errors", 1);

require_once dirname(__DIR__) . "/app/core/ErrorHandler.php";
set_exception_handler(['ErrorHandler', 'handleException']);
set_error_handler(['ErrorHandler', 'handleError']);


// ========================================
// CORS SUPPORT (FIXED FOR SESSION)
// ========================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
    'http://localhost',
    'http://localhost:80',
    'http://127.0.0.1',
];

if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // If no origin (same-origin request), don't send the header or send current host
    $protocol = isset($_SERVER['HTTPS']) ? 'https' : 'http';
    header("Access-Control-Allow-Origin: $protocol://" . $_SERVER['HTTP_HOST']);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ========================================
// DEFINE BASE PATH
// ========================================

define("BASE_PATH", dirname(__DIR__));

require_once BASE_PATH . "/app/core/Config.php";
Config::load(BASE_PATH . "/.env");


// ========================================
// STATIC FILE HANDLER
// Prevent router from handling html/css/js
// ========================================

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$parsedPath = parse_url($requestUri, PHP_URL_PATH);

if (preg_match('/\.(html|css|js|png|jpg|jpeg|gif|svg)$/', $parsedPath)) {
    $file = BASE_PATH . '/public' . $parsedPath;
    if (file_exists($file)) {
        return false;
    }
}


// ========================================
// LOAD CORE
// ========================================

require_once BASE_PATH . "/app/core/Database.php";
require_once BASE_PATH . "/app/core/Router.php";
require_once BASE_PATH . "/app/core/Session.php";
require_once BASE_PATH . "/app/core/Controller.php";
require_once BASE_PATH . "/app/core/Model.php";
require_once BASE_PATH . "/app/core/RateLimiter.php";
require_once BASE_PATH . "/app/core/Csrf.php";

// Start session with correct path from Config
Session::start();


// ========================================
// RATE LIMITING
// ========================================

$rateLimiter = new RateLimiter();
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!$rateLimiter->check($clientIp, $_SERVER['REQUEST_URI'])) {
    http_response_code(429);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Too many requests. Please try again later."]);
    exit();
}


// ========================================
// LOAD HELPERS
// ========================================

require_once BASE_PATH . "/app/helpers/helpers.php";
require_once BASE_PATH . "/app/helpers/response.php";
require_once BASE_PATH . "/app/helpers/constants.php";


// ========================================
// LOAD MIDDLEWARE
// ========================================

require_once BASE_PATH . "/app/middleware/AuthMiddleware.php";
require_once BASE_PATH . "/app/middleware/RoleMiddleware.php";


// ========================================
// LOAD CONTROLLERS
// ========================================

require_once BASE_PATH . "/app/Controllers/TestController.php";
require_once BASE_PATH . "/app/Controllers/AuthController.php";
require_once BASE_PATH . "/app/Controllers/StudentController.php";
require_once BASE_PATH . "/app/Controllers/ApplicationController.php";
require_once BASE_PATH . "/app/Controllers/DocumentController.php";
require_once BASE_PATH . "/app/Controllers/CertificateController.php";
require_once BASE_PATH . "/app/Controllers/NotificationController.php";
require_once BASE_PATH . "/app/Controllers/ProfileController.php";

// Admin Controllers — loaded lazily inside routes only
// require_once BASE_PATH . "/app/Controllers/AdminController.php";
// require_once BASE_PATH . "/app/Controllers/AdminApplicationController.php";
// require_once BASE_PATH . "/app/Controllers/AdminCertificateController.php";
// require_once BASE_PATH . "/app/Controllers/AdminUserController.php";
// require_once BASE_PATH . "/app/Controllers/AdminLogsController.php";


// ========================================
// SESSION already started at top — skip
// ========================================
// Session::start() — already called above


// ========================================
// CREATE ROUTER
// ========================================

$router = new Router();


// ========================================
// LOAD ROUTES
// ========================================

require_once BASE_PATH . "/config/routes.php";


// ========================================
// URI NORMALIZATION
// ========================================

$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Remove query string
$uri = parse_url($uri, PHP_URL_PATH);

// Remove base folder
// Detect base folder dynamically
$scriptName = $_SERVER['SCRIPT_NAME'];
$baseFolder = str_replace('/index.php', '', $scriptName);
if (strpos($uri, $baseFolder) === 0) {
    $uri = substr($uri, strlen($baseFolder));
}

// Remove index.php
if (strpos($uri, '/index.php') === 0) {
    $uri = substr($uri, strlen('/index.php'));
}

// Fix empty URI
if (!$uri || trim($uri) === '') {
    $uri = '/';
}

// Ensure leading slash
if ($uri[0] !== '/') {
    $uri = '/' . $uri;
}

// Remove trailing slash
if ($uri !== '/') {
    $uri = rtrim($uri, '/');
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Resolve route
$router->resolve($uri, $method);