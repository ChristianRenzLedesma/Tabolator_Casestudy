<?php
// Temporarily use manual loading to test
require_once __DIR__ . '/../src/Models/User.php';

use Tabolator\Models\User;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    error_log("Attempting to create User instance...");
    $user = new User();
    error_log("User instance created successfully");
} catch (Exception $e) {
    error_log("Error creating User: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';

switch ($request_method) {
    case 'GET':
        if (preg_match('/\/(\d+)$/', $path_info, $matches)) {
            $user_id = $matches[1];
            echo json_encode($user->getUserById($user_id));
        } else {
            echo json_encode($user->getAllUsers());
        }
        break;
    case 'POST':
        $raw_input = file_get_contents('php://input');
        error_log("Raw POST data: " . $raw_input);
        $data = json_decode($raw_input, true);
        error_log("Decoded POST data: " . print_r($data, true));
        echo json_encode($user->createUser($data));
        break;
    case 'PUT':
        if (preg_match('/\/(\d+)$/', $path_info, $matches)) {
            $user_id = $matches[1];
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($user->updateUser($user_id, $data));
        }
        break;
    case 'DELETE':
        if (preg_match('/\/(\d+)$/', $path_info, $matches)) {
            $user_id = $matches[1];
            echo json_encode($user->deleteUser($user_id));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>