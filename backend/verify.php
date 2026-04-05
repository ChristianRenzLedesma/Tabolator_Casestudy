<?php
// Quick Verification Script
// Check if everything is working after the fix

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "🔍 Verifying Database Status...\n\n";
    
    // Check categories
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    $catCount = $stmt->fetch()['count'];
    echo "📋 Categories: $catCount\n";
    
    // Check criteria
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $critCount = $stmt->fetch()['count'];
    echo "📋 Criteria: $critCount\n";
    
    // Show sample data
    if ($critCount > 0) {
        echo "\n📋 Sample Data:\n";
        $stmt = $pdo->query("SELECT id, category_name, name, percentage FROM criteria ORDER BY category_name, name LIMIT 5");
        while ($row = $stmt->fetch()) {
            echo "ID: {$row['id']} - {$row['name']} ({$row['category_name']}) - {$row['percentage']}%\n";
        }
    }
    
    echo "\n✅ Database verification complete!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
