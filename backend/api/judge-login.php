<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['pin'])) {
        throw new Exception('PIN is required');
    }
    
    $pin = $data['pin'];
    
    // Validate PIN format (4 digits)
    if (!preg_match('/^\d{4}$/', $pin)) {
        throw new Exception('Invalid PIN format. Must be 4 digits.');
    }
    
    // Query judge by PIN
    $stmt = $pdo->prepare("SELECT id, name, pin FROM judges WHERE pin = :pin");
    $stmt->execute(['pin' => $pin]);
    $judge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$judge) {
        throw new Exception('Invalid PIN. No judge found with this PIN.');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'judge' => [
            'id' => $judge['id'],
            'name' => $judge['name'],
            'pin' => $judge['pin']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
