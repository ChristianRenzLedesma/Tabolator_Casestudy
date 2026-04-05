<?php
// Quick Database Population Script
// This will populate your empty criteria table

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "🔧 Populating Database with Sample Data...\n\n";
    
    // Check if categories exist
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    $categoryCount = $stmt->fetch()['count'];
    
    if ($categoryCount == 0) {
        echo "⚠️ No categories found - Creating...\n";
        
        // Insert sample categories
        $categories = [
            ['Talent', 'Performance and talent-based competitions'],
            ['Beauty', 'Physical appearance and poise evaluation'],
            ['Intelligence', 'IQ and knowledge-based assessment'],
            ['Poise', 'Grace, confidence, and stage presence']
        ];
        
        foreach ($categories as $cat) {
            $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
            $stmt->execute($cat);
        }
        echo "✅ Categories created\n";
    }
    
    // Get category IDs
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY id");
    $categoryMap = [];
    while ($row = $stmt->fetch()) {
        $categoryMap[$row['name']] = $row['id'];
    }
    echo "✅ Category IDs loaded\n";
    
    // Check if criteria exist
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $criteriaCount = $stmt->fetch()['count'];
    
    if ($criteriaCount == 0) {
        echo "⚠️ No criteria found - Creating sample data...\n";
        
        // Sample criteria data
        $sampleCriteria = [
            ['Talent', 'Performance Quality', 'Overall quality of performance', 40.00, 1.00, 10.00],
            ['Talent', 'Originality', 'Creativity and uniqueness', 30.00, 1.00, 10.00],
            ['Talent', 'Stage Presence', 'Confidence and stage command', 30.00, 1.00, 10.00],
            ['Beauty', 'Facial Features', 'Facial symmetry and features', 35.00, 1.00, 10.00],
            ['Beauty', 'Skin Complexion', 'Skin quality and complexion', 30.00, 1.00, 10.00],
            ['Beauty', 'Body Proportion', 'Body measurements and proportion', 35.00, 1.00, 10.00],
            ['Intelligence', 'General Knowledge', 'Breadth of knowledge', 35.00, 1.00, 10.00],
            ['Intelligence', 'Problem Solving', 'Analytical thinking', 35.00, 1.00, 10.00],
            ['Intelligence', 'Communication', 'Verbal and written skills', 30.00, 1.00, 10.00],
            ['Poise', 'Confidence', 'Self-assurance and poise', 40.00, 1.00, 10.00],
            ['Poise', 'Grace', 'Elegance and movement', 30.00, 1.00, 10.00],
            ['Poise', 'Stage Presence', 'Command of the stage', 30.00, 1.00, 10.00]
        ];
        
        foreach ($sampleCriteria as $criteria) {
            $categoryName = $criteria[0];
            $categoryId = $categoryMap[$categoryName] ?? null;
            
            if (!$categoryId) {
                echo "❌ Category '$categoryName' not found!\n";
                continue;
            }
            
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
                echo "✅ Added: {$criteria[1]} (Category: $categoryName)\n";
            } else {
                echo "❌ Failed to add: {$criteria[1]}\n";
            }
        }
    }
    
    // Final verification
    echo "\n📊 Final Database Status:\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    $catCount = $stmt->fetch()['count'];
    echo "📋 Categories: $catCount\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $critCount = $stmt->fetch()['count'];
    echo "📋 Criteria: $critCount\n";
    
    if ($critCount > 0) {
        echo "\n📋 Sample Criteria Records:\n";
        $stmt = $pdo->query("SELECT id, category_name, name, percentage, min_score, max_score FROM criteria LIMIT 5");
        while ($row = $stmt->fetch()) {
            echo "ID: {$row['id']} - {$row['name']} ({$row['category_name']}) - {$row['percentage']}% - {$row['min_score']}-{$row['max_score']}\n";
        }
    }
    
    echo "\n✅ Database population completed!\n";
    echo "🌐 Test API: http://localhost/Tabolator_Casestudy/backend/api/criteria\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
