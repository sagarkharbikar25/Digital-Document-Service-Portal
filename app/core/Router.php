<?php

class Router
{
    private $routes = [];

    public function get($path, $callback)
    {
        $path = $this->normalize($path);
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback)
    {
        $path = $this->normalize($path);
        $this->routes['POST'][$path] = $callback;
    }

    private function normalize($uri)
    {
        if (!$uri) return '/';

        // remove query string
        $uri = parse_url($uri, PHP_URL_PATH);

        // decode URL
        $uri = urldecode($uri);

        // remove base folder if exists
        // Detect base folder dynamically (e.g., /college portal/public)
        $scriptName = $_SERVER['SCRIPT_NAME'];
        $base = str_replace('/index.php', '', $scriptName);

        if (strpos($uri, $base) === 0)
        {
            $uri = substr($uri, strlen($base));
        }

        // remove spaces
        $uri = trim($uri);

        // ensure starts with /
        if ($uri === '')
        {
            return '/';
        }

        if ($uri[0] !== '/')
        {
            $uri = '/' . $uri;
        }

        // remove trailing slash
        $uri = rtrim($uri, '/');

        if ($uri === '')
        {
            $uri = '/';
        }

        return $uri;
    }

    public function resolve($uri, $method)
    {
        $uri = $this->normalize($uri);

        if (isset($this->routes[$method][$uri]))
        {
            // CSRF Verification for state-changing methods
            if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
                $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;
                if (!Csrf::verify($token)) {
                    header("Content-Type: application/json");
                    http_response_code(403);
                    echo json_encode(["status" => "error", "message" => "Invalid CSRF token"]);
                    exit();
                }
            }

            $callback = $this->routes[$method][$uri];

            if (is_callable($callback))
            {
                call_user_func($callback);
                return;
            }
        }

        header("Content-Type: application/json");
        http_response_code(404);

        echo json_encode([
            "status" => "error",
            "message" => "Route not found",
            "uri" => $uri,
            "method" => $method
        ]);
    }
    
}