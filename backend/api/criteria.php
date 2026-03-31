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
            $category = $_GET['category'] ?? '';
            if ($category) {
                $stmt = $pdo->prepare("
                    SELECT c.*, cat.name as category_name 
                    FROM criteria c 
                    JOIN categories cat ON c.category_id = cat.id 
                    WHERE cat.name = ? 
                    ORDER BY c.name
                ");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("
                    SELECT c.*, cat.name as category_name 
                    FROM criteria c 
                    JOIN categories cat ON c.category_id = cat.id 
                    ORDER BY cat.name, c.name
                ");
            }
            $criteria = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $criteria]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate total percentage doesn't exceed 100%
            $totalCheck = $pdo->prepare("SELECT SUM(percentage) as total FROM criteria");
            $totalCheck->execute();
            $currentTotal = $totalCheck->fetch()['total'] ?? 0;
            
            $newTotal = $currentTotal + $data['percentage'];
            
            if ($newTotal > 100) {
                throw new Exception("Cannot add criterion. Total percentage would be {$newTotal}%. Maximum allowed is 100%.");
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO criteria (category_id, name, percentage, min_score, max_score) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['category_id'], 
                $data['name'], 
                $data['percentage'], 
                $data['min_score'], 
                $data['max_score']
            ]);
            echo json_encode(['success' => true, 'message' => 'Criterion added successfully']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Get current criterion percentage
            $currentStmt = $pdo->prepare("SELECT percentage FROM criteria WHERE id = ?");
            $currentStmt->execute([$data['id']]);
            $currentPercentage = $currentStmt->fetch()['percentage'] ?? 0;
            
            // Calculate new total
            $totalCheck = $pdo->prepare("SELECT SUM(percentage) as total FROM criteria WHERE id != ?");
            $totalCheck->execute([$data['id']]);
            $otherTotal = $totalCheck->fetch()['total'] ?? 0;
            
            $newTotal = $otherTotal + $data['percentage'];
            
            if ($newTotal > 100) {
                throw new Exception("Cannot update criterion. Total percentage would be {$newTotal}%. Maximum allowed is 100%.");
            }
            
            $stmt = $pdo->prepare("
                UPDATE criteria 
                SET name = ?, percentage = ?, min_score = ?, max_score = ? 
                WHERE id = ?
            ");
            $stmt->execute([
                $data['name'], 
                $data['percentage'], 
                $data['min_score'], 
                $data['max_score'], 
                $data['id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Criterion updated successfully']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'];
            $stmt = $pdo->prepare("DELETE FROM criteria WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Criterion deleted successfully']);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
