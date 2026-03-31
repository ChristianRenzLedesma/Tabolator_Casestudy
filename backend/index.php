<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$request_uri = $_SERVER['REQUEST_URI'];
$script_name = $_SERVER['SCRIPT_NAME'];

// Remove query string from URI
$request_uri = explode('?', $request_uri)[0];

// Remove script name from URI to get clean path
$base_path = str_replace('/index.php', '', $script_name);
$request_path = str_replace($base_path, '', $request_uri);

// Route the request
switch ($request_path) {
    case '/api/categories':
    case '/Tabolator_Casestudy/backend/api/categories':
        require_once 'api/categories.php';
        break;
        
    case '/api/criteria':
    case '/Tabolator_Casestudy/backend/api/criteria':
        require_once 'api/criteria.php';
        break;
        
    case '/api/judges':
    case '/Tabolator_Casestudy/backend/api/judges':
        require_once 'api/judges.php';
        break;
        
    case '/api/contestants':
    case '/Tabolator_Casestudy/backend/api/contestants':
        require_once 'api/contestants.php';
        break;
        
    case '/api/judge-login':
    case '/Tabolator_Casestudy/backend/api/judge-login':
        require_once 'api/judge-login.php';
        break;
        
    case '/api/user':
    case '/Tabolator_Casestudy/backend/api/user':
        require_once 'api/user.php';
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found',
            'available_endpoints' => [
                '/api/categories',
                '/api/criteria',
                '/api/judges',
                '/api/contestants',
                '/api/judge-login',
                '/api/user'
            ]
        ]);
}
?>
