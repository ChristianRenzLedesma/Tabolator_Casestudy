<?php
// Insert Sample Criteria Data
// Simple script to populate criteria table

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "🔧 Inserting Sample Criteria Data...\n\n";
    
    // Step 1: Check if we have categories
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY id");
    $categories = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    if (empty($categories)) {
        echo "❌ No categories found! Creating categories first...\n";
        
        // Create basic categories
        $categoryData = [
            ['Talent', 'Performance and talent-based competitions'],
            ['Beauty', 'Physical appearance and poise evaluation'],
            ['Intelligence', 'IQ and knowledge-based assessment'],
            ['Poise', 'Grace, confidence, and stage presence']
        ];
        
        foreach ($categoryData as $cat) {
            $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
            $stmt->execute($cat);
        }
        
        // Get categories again
        $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY id");
        $categories = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo "✅ Categories created\n";
    }
    
    echo "✅ Found categories: " . implode(', ', array_values($categories)) . "\n";
    
    // Step 2: Insert sample criteria
    $sampleCriteria = [
        // Talent Category
        ['Talent', 'Performance Quality', 'Overall quality of performance', 40.00, 1.00, 10.00],
        ['Talent', 'Originality', 'Creativity and uniqueness', 30.00, 1.00, 10.00],
        ['Talent', 'Stage Presence', 'Confidence and stage command', 30.00, 1.00, 10.00],
        
        // Beauty Category
        ['Beauty', 'Facial Features', 'Facial symmetry and features', 35.00, 1.00, 10.00],
        ['Beauty', 'Skin Complexion', 'Skin quality and complexion', 30.00, 1.00, 10.00],
        ['Beauty', 'Body Proportion', 'Body measurements and proportion', 35.00, 1.00, 10.00],
        
        // Intelligence Category
        ['Intelligence', 'General Knowledge', 'Breadth of knowledge', 35.00, 1.00, 10.00],
        ['Intelligence', 'Problem Solving', 'Analytical thinking', 35.00, 1.00, 10.00],
        ['Intelligence', 'Communication', 'Verbal and written skills', 30.00, 1.00, 10.00],
        
        // Poise Category
        ['Poise', 'Confidence', 'Self-assurance and poise', 40.00, 1.00, 10.00],
        ['Poise', 'Grace', 'Elegance and movement', 30.00, 1.00, 10.00],
        ['Poise', 'Stage Presence', 'Command of the stage', 30.00, 1.00, 10.00]
    ];
    
    echo "\n📋 Inserting sample criteria...\n";
    
    $insertedCount = 0;
    foreach ($sampleCriteria as $criteria) {
        $categoryName = $criteria[0];
        $categoryId = array_search($categoryName, $categories);
        
        if ($categoryId === false) {
            echo "❌ Category '$categoryName' not found! Skipping.\n";
            continue;
        }
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO criteria (category_id, category_name, name, description, percentage, min_score, max_score, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $result = $stmt->execute([
                $categoryId,
                $categoryName,
                $criteria[1], // name
                $criteria[2], // description
                $criteria[3], // percentage
                $criteria[4], // min_score
                $criteria[5]  // max_score
            ]);
            
            if ($result) {
                $insertedCount++;
                echo "✅ Inserted: {$criteria[1]} (Category: $categoryName)\n";
            } else {
                echo "❌ Failed to insert: {$criteria[1]}\n";
            }
        } catch (Exception $e) {
            echo "❌ Error inserting {$criteria[1]}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📊 Results:\n";
    echo "✅ Successfully inserted: $insertedCount criteria\n";
    
    // Step 3: Show final data
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $totalCount = $stmt->fetch()['count'];
    echo "📊 Total criteria in database: $totalCount\n";
    
    if ($totalCount > 0) {
        echo "\n📋 Sample records:\n";
        $stmt = $pdo->query("SELECT id, category_name, name, percentage, min_score, max_score FROM criteria ORDER BY category_name, name LIMIT 8");
        while ($row = $stmt->fetch()) {
            echo "ID: {$row['id']} - {$row['name']} ({$row['category_name']}) - {$row['percentage']}% - {$row['min_score']}-{$row['max_score']}\n";
        }
    }
    
    echo "\n✅ Sample data insertion completed!\n";
    echo "🌐 Test API: http://localhost/Tabolator_Casestudy/backend/api/criteria\n";
    echo "🖥️ Test frontend: http://localhost/Tabolator_Casestudy/frontend\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
