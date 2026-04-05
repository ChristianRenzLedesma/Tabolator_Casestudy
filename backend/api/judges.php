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
            $stmt = $pdo->query("SELECT * FROM judges ORDER BY name");
            $judges = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $judges]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || empty(trim($data['name']))) {
                echo json_encode(['success' => false, 'message' => 'Judge name is required']);
                break;
            }
            
            $name = trim($data['name']);
            
            // Handle PIN - use provided PIN or generate one
            if (isset($data['pin']) && !empty(trim($data['pin']))) {
                // Validate manual PIN
                $pin = trim($data['pin']);
                if (!preg_match('/^\d{4}$/', $pin)) {
                    echo json_encode(['success' => false, 'message' => 'PIN must be exactly 4 digits']);
                    break;
                }
                
                // Check for duplicate PIN
                $checkStmt = $pdo->prepare("SELECT id FROM judges WHERE pin = ?");
                $checkStmt->execute([$pin]);
                if ($checkStmt->fetch()) {
                    echo json_encode(['success' => false, 'message' => 'PIN already exists. Please choose a different PIN.']);
                    break;
                }
            } else {
                // Generate unique PIN
                do {
                    $pin = sprintf('%04d', rand(1000, 9999));
                    $checkStmt = $pdo->prepare("SELECT id FROM judges WHERE pin = ?");
                    $checkStmt->execute([$pin]);
                } while ($checkStmt->fetch());
            }
            
            // Insert judge
            $stmt = $pdo->prepare("INSERT INTO judges (name, pin) VALUES (?, ?)");
            $result = $stmt->execute([$name, $pin]);
            
            if ($result) {
                $judgeId = $pdo->lastInsertId();
                $judgeData = [
                    'id' => $judgeId,
                    'name' => $name,
                    'pin' => $pin,
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                $pinType = isset($data['pin']) ? 'manual' : 'auto-generated';
                echo json_encode([
                    'success' => true, 
                    'message' => 'Judge added successfully', 
                    'pin' => $pin,
                    'pin_type' => $pinType,
                    'data' => $judgeData
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add judge']);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['name'])) {
                echo json_encode(['success' => false, 'message' => 'Judge ID and name are required']);
                break;
            }
            
            $stmt = $pdo->prepare("UPDATE judges SET name = ? WHERE id = ?");
            $result = $stmt->execute([$data['name'], $data['id']]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Judge updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update judge']);
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                echo json_encode(['success' => false, 'message' => 'Judge ID is required']);
                break;
            }
            
            $id = $_GET['id'];
            $stmt = $pdo->prepare("DELETE FROM judges WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Judge deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete judge']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
