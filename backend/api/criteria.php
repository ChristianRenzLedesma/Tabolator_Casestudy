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
                    SELECT * FROM criteria 
                    WHERE category_name = ? 
                    ORDER BY name
                ");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("
                    SELECT * FROM criteria 
                    ORDER BY category_name, name
                ");
            }
            $criteria = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $criteria]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Input validation
            $errors = [];
            
            // Validate required fields
            if (empty($data['category_id'])) {
                $errors[] = 'Category is required';
            }
            if (empty($data['name'])) {
                $errors[] = 'Name is required';
            }
            if (!isset($data['percentage']) || $data['percentage'] === '') {
                $errors[] = 'Percentage is required';
            }
            if (!isset($data['min_score']) || $data['min_score'] === '') {
                $errors[] = 'Minimum score is required';
            }
            if (!isset($data['max_score']) || $data['max_score'] === '') {
                $errors[] = 'Maximum score is required';
            }
            
            // Validate numeric values
            if (!is_numeric($data['percentage']) || $data['percentage'] <= 0) {
                $errors[] = 'Percentage must be a positive number';
            }
            if (!is_numeric($data['min_score']) || $data['min_score'] < 0) {
                $errors[] = 'Minimum score must be a non-negative number';
            }
            if (!is_numeric($data['max_score']) || $data['max_score'] <= 0) {
                $errors[] = 'Maximum score must be a positive number';
            }
            
            // Validate score range
            if ($data['min_score'] >= $data['max_score']) {
                $errors[] = 'Maximum score must be greater than minimum score';
            }
            
            // Validate percentage range
            if ($data['percentage'] > 100) {
                $errors[] = 'Percentage cannot exceed 100%';
            }
            
            // Check if category exists and get category name
            $categoryCheck = $pdo->prepare("SELECT id, name FROM categories WHERE id = ?");
            $categoryCheck->execute([$data['category_id']]);
            $category = $categoryCheck->fetch();
            
            if (!$category) {
                $errors[] = 'Invalid category selected';
            }
            
            // Validate total percentage doesn't exceed 100% for this category
            $totalCheck = $pdo->prepare("SELECT SUM(percentage) as total FROM criteria WHERE category_id = ?");
            $totalCheck->execute([$data['category_id']]);
            $currentTotal = $totalCheck->fetch()['total'] ?? 0;
            
            $newTotal = $currentTotal + $data['percentage'];
            
            if ($newTotal > 100) {
                $errors[] = "Cannot add criterion. Total percentage for this category would be {$newTotal}%. Maximum allowed is 100%.";
            }
            
            // Return errors if any
            if (!empty($errors)) {
                echo json_encode(['success' => false, 'message' => 'Validation failed', 'errors' => $errors]);
                exit;
            }
            
            // Generate description if not provided
            $description = $data['description'] ?? "Criteria for {$data['name']} in category ID {$data['category_id']}";
            
            // Insert with all required fields
            $stmt = $pdo->prepare("
                INSERT INTO criteria (category_id, category_name, name, description, percentage, min_score, max_score, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $result = $stmt->execute([
                $data['category_id'], 
                $category['name'], // Add category name
                $data['name'], 
                $description,
                $data['percentage'], 
                $data['min_score'], 
                $data['max_score']
            ]);
            
            if ($result) {
                $insertedId = $pdo->lastInsertId();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Criterion added successfully',
                    'data' => [
                        'id' => $insertedId,
                        'category_id' => $data['category_id'],
                        'category_name' => $category['name'], // Add category name
                        'name' => $data['name'],
                        'description' => $description,
                        'percentage' => $data['percentage'],
                        'min_score' => $data['min_score'],
                        'max_score' => $data['max_score'],
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add criterion']);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Get current criterion to check its category
            $currentStmt = $pdo->prepare("SELECT category_id, percentage FROM criteria WHERE id = ?");
            $currentStmt->execute([$data['id']]);
            $currentCriterion = $currentStmt->fetch();
            
            if (!$currentCriterion) {
                throw new Exception("Criterion not found");
            }
            
            // Calculate new total for this category only
            $totalCheck = $pdo->prepare("SELECT SUM(percentage) as total FROM criteria WHERE category_id = ? AND id != ?");
            $totalCheck->execute([$currentCriterion['category_id'], $data['id']]);
            $otherTotal = $totalCheck->fetch()['total'] ?? 0;
            
            $newTotal = $otherTotal + $data['percentage'];
            
            if ($newTotal > 100) {
                throw new Exception("Cannot update criterion. Total percentage for this category would be {$newTotal}%. Maximum allowed is 100%.");
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
