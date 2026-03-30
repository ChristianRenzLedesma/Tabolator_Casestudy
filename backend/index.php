<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


$request_uri = $_SERVER['REQUEST_URI'];
$path_info = parse_url($request_uri, PHP_URL_PATH);

// Handle different URL patterns
if (strpos($path_info, '/Tabolator_Casestudy/backend/api/user') !== false) {
    $_SERVER['PATH_INFO'] = str_replace('/Tabolator_Casestudy/backend/api/user', '', $path_info);
    require_once 'api/user.php';
} elseif (strpos($path_info, '/api/user') !== false) {
    $_SERVER['PATH_INFO'] = str_replace('/api/user', '', $path_info);
    require_once 'api/user.php';
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'API endpoint not found',
        'debug_info' => [
            'request_uri' => $request_uri,
            'path_info' => $path_info
        ]
    ]);
}
?>
