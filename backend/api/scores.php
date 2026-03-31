<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get scores - can filter by judge_id and/or contestant_id
            $judge_id = $_GET['judge_id'] ?? null;
            $contestant_id = $_GET['contestant_id'] ?? null;
            
            $sql = "SELECT s.*, c.name as contestant_name, cr.name as criterion_name, cr.category 
                    FROM scores s 
                    JOIN contestants c ON s.contestant_id = c.id 
                    JOIN criteria cr ON s.criterion_id = cr.id";
            $params = [];
            
            if ($judge_id) {
                $sql .= " WHERE s.judge_id = :judge_id";
                $params['judge_id'] = $judge_id;
            }
            
            if ($contestant_id) {
                $sql .= ($judge_id ? " AND" : " WHERE") . " s.contestant_id = :contestant_id";
                $params['contestant_id'] = $contestant_id;
            }
            
            $sql .= " ORDER BY s.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $scores]);
            break;
            
        case 'POST':
            // Submit new score
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['judge_id']) || !isset($data['contestant_id']) || !isset($data['criterion_id']) || !isset($data['score'])) {
                throw new Exception('Missing required fields: judge_id, contestant_id, criterion_id, score');
            }
            
            $judge_id = $data['judge_id'];
            $contestant_id = $data['contestant_id'];
            $criterion_id = $data['criterion_id'];
            $score = $data['score'];
            
            // Validate score is within criterion range
            $criterionStmt = $pdo->prepare("SELECT min_score, max_score FROM criteria WHERE id = :criterion_id");
            $criterionStmt->execute(['criterion_id' => $criterion_id]);
            $criterion = $criterionStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$criterion) {
                throw new Exception('Criterion not found');
            }
            
            if ($score < $criterion['min_score'] || $score > $criterion['max_score']) {
                throw new Exception("Score must be between {$criterion['min_score']} and {$criterion['max_score']}");
            }
            
            // Check if score already exists
            $checkStmt = $pdo->prepare("SELECT id FROM scores WHERE judge_id = :judge_id AND contestant_id = :contestant_id AND criterion_id = :criterion_id");
            $checkStmt->execute([
                'judge_id' => $judge_id,
                'contestant_id' => $contestant_id,
                'criterion_id' => $criterion_id
            ]);
            
            if ($checkStmt->fetch()) {
                // Update existing score
                $stmt = $pdo->prepare("UPDATE scores SET score = :score, updated_at = CURRENT_TIMESTAMP WHERE judge_id = :judge_id AND contestant_id = :contestant_id AND criterion_id = :criterion_id");
                $message = 'Score updated successfully';
            } else {
                // Insert new score
                $stmt = $pdo->prepare("INSERT INTO scores (judge_id, contestant_id, criterion_id, score, created_at, updated_at) VALUES (:judge_id, :contestant_id, :criterion_id, :score, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
                $message = 'Score submitted successfully';
            }
            
            $stmt->execute([
                'judge_id' => $judge_id,
                'contestant_id' => $contestant_id,
                'criterion_id' => $criterion_id,
                'score' => $score
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => $message,
                'data' => [
                    'judge_id' => $judge_id,
                    'contestant_id' => $contestant_id,
                    'criterion_id' => $criterion_id,
                    'score' => $score
                ]
            ]);
            break;
            
        case 'PUT':
            // Update score (same as POST logic)
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['id']) || !isset($data['score'])) {
                throw new Exception('Missing required fields: id, score');
            }
            
            $score_id = $data['id'];
            $score = $data['score'];
            
            // Get criterion info for validation
            $stmt = $pdo->prepare("SELECT s.criterion_id, c.min_score, c.max_score FROM scores s JOIN criteria c ON s.criterion_id = c.id WHERE s.id = :score_id");
            $stmt->execute(['score_id' => $score_id]);
            $scoreInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$scoreInfo) {
                throw new Exception('Score not found');
            }
            
            if ($score < $scoreInfo['min_score'] || $score > $scoreInfo['max_score']) {
                throw new Exception("Score must be between {$scoreInfo['min_score']} and {$scoreInfo['max_score']}");
            }
            
            $updateStmt = $pdo->prepare("UPDATE scores SET score = :score, updated_at = CURRENT_TIMESTAMP WHERE id = :score_id");
            $updateStmt->execute([
                'score_id' => $score_id,
                'score' => $score
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Score updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete score
            $score_id = $_GET['id'] ?? null;
            
            if (!$score_id) {
                throw new Exception('Score ID is required');
            }
            
            $stmt = $pdo->prepare("DELETE FROM scores WHERE id = :score_id");
            $stmt->execute(['score_id' => $score_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Score deleted successfully'
            ]);
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
