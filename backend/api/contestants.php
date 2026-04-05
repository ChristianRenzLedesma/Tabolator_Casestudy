<?php
require_once __DIR__ . '/../config/database.php';

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
            $stmt = $pdo->query("SELECT * FROM contestants ORDER BY name");
            $contestants = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $contestants]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO contestants (name, status) VALUES (?, 'Active')");
            $stmt->execute([$data['name']]);
            
            // Get the inserted contestant with ID and status
            $insertedId = $pdo->lastInsertId();
            $createdContestant = [
                'id' => $insertedId,
                'name' => $data['name'],
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s')
            ];
            echo json_encode(['success' => true, 'message' => 'Contestant added successfully', 'data' => $createdContestant]);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['status'])) {
                $stmt = $pdo->prepare("UPDATE contestants SET status = ? WHERE id = ?");
                $stmt->execute([$data['status'], $data['id']]);
                echo json_encode(['success' => true, 'message' => 'Contestant status updated successfully']);
            } else {
                $stmt = $pdo->prepare("UPDATE contestants SET name = ? WHERE id = ?");
                $stmt->execute([$data['name'], $data['id']]);
                echo json_encode(['success' => true, 'message' => 'Contestant updated successfully']);
            }
            break;
            
        case 'DELETE':
            $id = $_GET['id'];
            $stmt = $pdo->prepare("DELETE FROM contestants WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Contestant deleted successfully']);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
