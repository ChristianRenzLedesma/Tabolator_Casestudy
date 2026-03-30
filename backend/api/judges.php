<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM judges ORDER BY name");
            $judges = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $judges]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $pin = sprintf('%04d', rand(1000, 9999));
            $stmt = $pdo->prepare("INSERT INTO judges (name, pin) VALUES (?, ?)");
            $stmt->execute([$data['name'], $pin]);
            echo json_encode(['success' => true, 'message' => 'Judge added successfully', 'pin' => $pin]);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE judges SET name = ? WHERE id = ?");
            $stmt->execute([$data['name'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'Judge updated successfully']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'];
            $stmt = $pdo->prepare("DELETE FROM judges WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Judge deleted successfully']);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
