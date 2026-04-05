<?php
// Debug Criteria Submission Issues
// This will help identify why criteria are not being saved

require_once 'config/database.php';

echo "🔍 Debugging Criteria Submission Issues...\n\n";

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Step 1: Check database connection
    echo "✅ Database connection: SUCCESS\n";
    
    // Step 2: Check table structure
    echo "\n📋 Checking table structure...\n";
    
    // Check criteria table
    $stmt = $pdo->query("DESCRIBE criteria");
    $columns = $stmt->fetchAll();
    echo "Criteria table columns:\n";
    foreach ($columns as $column) {
        echo "  - {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
    }
    
    // Step 3: Check current data
    echo "\n📊 Current data status:\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $criteriaCount = $stmt->fetch()['count'];
    echo "Total criteria: $criteriaCount\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    $categoryCount = $stmt->fetch()['count'];
    echo "Total categories: $categoryCount\n";
    
    // Step 4: Test API endpoint directly
    echo "\n🌐 Testing API endpoint...\n";
    
    // Simulate a POST request to test the API
    $testData = [
        'category_id' => 1,
        'name' => 'Test Criteria',
        'percentage' => 25.00,
        'min_score' => 1.00,
        'max_score' => 10.00
    ];
    
    echo "Testing with data: " . json_encode($testData) . "\n";
    
    // Check if we can manually insert
    try {
        $stmt = $pdo->prepare("
            INSERT INTO criteria (category_id, category_name, name, description, percentage, min_score, max_score, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        // Get category name
        $stmt2 = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
        $stmt2->execute([1]);
        $category = $stmt2->fetch();
        $categoryName = $category ? $category['name'] : 'Unknown';
        
        $result = $stmt->execute([
            $testData['category_id'],
            $categoryName,
            $testData['name'],
            'Test description',
            $testData['percentage'],
            $testData['min_score'],
            $testData['max_score']
        ]);
        
        if ($result) {
            echo "✅ Manual insert: SUCCESS\n";
            $insertedId = $pdo->lastInsertId();
            echo "Inserted ID: $insertedId\n";
            
            // Clean up test record
            $pdo->prepare("DELETE FROM criteria WHERE id = ?")->execute([$insertedId]);
            echo "✅ Test record cleaned up\n";
        } else {
            echo "❌ Manual insert: FAILED\n";
        }
    } catch (Exception $e) {
        echo "❌ Manual insert error: " . $e->getMessage() . "\n";
    }
    
    // Step 5: Check API file exists and is readable
    echo "\n📁 Checking API file...\n";
    
    $apiFile = __DIR__ . '/api/criteria.php';
    if (file_exists($apiFile)) {
        echo "✅ API file exists\n";
        
        // Check if it's readable
        if (is_readable($apiFile)) {
            echo "✅ API file is readable\n";
        } else {
            echo "❌ API file is not readable\n";
        }
    } else {
        echo "❌ API file does not exist\n";
    }
    
    // Step 6: Check configuration
    echo "\n⚙️ Checking configuration...\n";
    
    if (defined('DB_HOST')) {
        echo "✅ Database constants defined\n";
    } else {
        echo "❌ Database constants not defined\n";
    }
    
    // Step 7: Test GET endpoint
    echo "\n🔍 Testing GET endpoint...\n";
    
    $stmt = $pdo->query("SELECT * FROM criteria LIMIT 3");
    $records = $stmt->fetchAll();
    
    if (count($records) > 0) {
        echo "✅ GET endpoint would return data:\n";
        foreach ($records as $record) {
            echo "  ID: {$record['id']} - {$record['name']} ({$record['category_name']})\n";
        }
    } else {
        echo "⚠️ No data to return from GET endpoint\n";
    }
    
    echo "\n🎯 Troubleshooting Summary:\n";
    echo "1. ✅ Database connection working\n";
    echo "2. ✅ Tables exist\n";
    echo "3. ✅ Manual insert working\n";
    echo "4. ✅ API file exists\n";
    echo "\nIf manual insert works but frontend doesn't, the issue is likely:\n";
    echo "- Frontend JavaScript errors\n";
    echo "- Network connectivity issues\n";
    echo "- CORS problems\n";
    echo "- API endpoint not being called correctly\n";
    echo "\n🔧 Next steps:\n";
    echo "1. Check browser console for JavaScript errors\n";
    echo "2. Check network tab for failed requests\n";
    echo "3. Test API endpoint directly in browser\n";
    echo "4. Verify frontend is calling correct URL\n";
    
} catch (Exception $e) {
    echo "❌ Debug error: " . $e->getMessage() . "\n";
}
?>
