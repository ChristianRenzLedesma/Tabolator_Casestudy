<?php
// Simple Direct Insert - No Complex Logic
// This will directly insert sample data into criteria table

require_once 'config/database.php';

echo "🔧 Direct Sample Data Insertion...\n";

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Step 1: Check if tables exist
    echo "📋 Checking tables...\n";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'criteria'");
    $criteriaTable = $stmt->fetch();
    
    if (!$criteriaTable) {
        echo "❌ Criteria table doesn't exist! Creating it...\n";
        
        // Create criteria table
        $pdo->exec("
            CREATE TABLE criteria (
                id INT(11) NOT NULL AUTO_INCREMENT,
                category_id INT(11) NOT NULL,
                category_name VARCHAR(255) NOT NULL DEFAULT '',
                name VARCHAR(255) NOT NULL,
                description TEXT NULL,
                percentage DECIMAL(5,2) NOT NULL DEFAULT '0.00',
                min_score DECIMAL(5,2) NOT NULL DEFAULT '0.00',
                max_score DECIMAL(5,2) NOT NULL DEFAULT '10.00',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        echo "✅ Criteria table created\n";
    } else {
        echo "✅ Criteria table exists\n";
    }
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'categories'");
    $categoriesTable = $stmt->fetch();
    
    if (!$categoriesTable) {
        echo "❌ Categories table doesn't exist! Creating it...\n";
        
        // Create categories table
        $pdo->exec("
            CREATE TABLE categories (
                id INT(11) NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY unique_category_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        echo "✅ Categories table created\n";
    } else {
        echo "✅ Categories table exists\n";
    }
    
    // Step 2: Clear existing data (fresh start)
    echo "\n🗑️ Clearing existing data...\n";
    $pdo->exec("DELETE FROM criteria");
    $pdo->exec("DELETE FROM categories");
    echo "✅ Tables cleared\n";
    
    // Step 3: Insert categories first
    echo "\n📋 Inserting categories...\n";
    
    $categories = [
        ['Talent', 'Performance and talent-based competitions'],
        ['Beauty', 'Physical appearance and poise evaluation'],
        ['Intelligence', 'IQ and knowledge-based assessment'],
        ['Poise', 'Grace, confidence, and stage presence']
    ];
    
    foreach ($categories as $cat) {
        $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        $result = $stmt->execute($cat);
        
        if ($result) {
            $id = $pdo->lastInsertId();
            echo "✅ Inserted category: {$cat[0]} (ID: $id)\n";
        } else {
            echo "❌ Failed to insert: {$cat[0]}\n";
        }
    }
    
    // Step 4: Get category IDs
    echo "\n🔍 Getting category IDs...\n";
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY id");
    $categoryMap = [];
    while ($row = $stmt->fetch()) {
        $categoryMap[$row['name']] = $row['id'];
        echo "✅ {$row['name']} = ID {$row['id']}\n";
    }
    
    // Step 5: Insert criteria
    echo "\n📋 Inserting criteria...\n";
    
    $criteriaData = [
        [1, 'Talent', 'Performance Quality', 'Overall quality of performance', 40.00, 1.00, 10.00],
        [1, 'Talent', 'Originality', 'Creativity and uniqueness', 30.00, 1.00, 10.00],
        [1, 'Talent', 'Stage Presence', 'Confidence and stage command', 30.00, 1.00, 10.00],
        [2, 'Beauty', 'Facial Features', 'Facial symmetry and features', 35.00, 1.00, 10.00],
        [2, 'Beauty', 'Skin Complexion', 'Skin quality and complexion', 30.00, 1.00, 10.00],
        [2, 'Beauty', 'Body Proportion', 'Body measurements and proportion', 35.00, 1.00, 10.00],
        [3, 'Intelligence', 'General Knowledge', 'Breadth of knowledge', 35.00, 1.00, 10.00],
        [3, 'Intelligence', 'Problem Solving', 'Analytical thinking', 35.00, 1.00, 10.00],
        [3, 'Intelligence', 'Communication', 'Verbal and written skills', 30.00, 1.00, 10.00],
        [4, 'Poise', 'Confidence', 'Self-assurance and poise', 40.00, 1.00, 10.00],
        [4, 'Poise', 'Grace', 'Elegance and movement', 30.00, 1.00, 10.00],
        [4, 'Poise', 'Stage Presence', 'Command of the stage', 30.00, 1.00, 10.00]
    ];
    
    foreach ($criteriaData as $criteria) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO criteria (category_id, category_name, name, description, percentage, min_score, max_score) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $criteria[0], // category_id
                $criteria[1], // category_name
                $criteria[2], // name
                $criteria[3], // description
                $criteria[4], // percentage
                $criteria[5], // min_score
                $criteria[6]  // max_score
            ]);
            
            if ($result) {
                $id = $pdo->lastInsertId();
                echo "✅ Inserted: {$criteria[2]} (ID: $id)\n";
            } else {
                echo "❌ Failed to insert: {$criteria[2]}\n";
            }
        } catch (Exception $e) {
            echo "❌ Error inserting {$criteria[2]}: " . $e->getMessage() . "\n";
        }
    }
    
    // Step 6: Verify data
    echo "\n📊 Verification:\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
    $catCount = $stmt->fetch()['count'];
    echo "📋 Total categories: $catCount\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
    $critCount = $stmt->fetch()['count'];
    echo "📋 Total criteria: $critCount\n";
    
    if ($critCount > 0) {
        echo "\n📋 Sample criteria records:\n";
        $stmt = $pdo->query("SELECT id, category_name, name, percentage, min_score, max_score FROM criteria ORDER BY category_name, name LIMIT 5");
        while ($row = $stmt->fetch()) {
            echo "ID: {$row['id']} - {$row['name']} ({$row['category_name']}) - {$row['percentage']}% - {$row['min_score']}-{$row['max_score']}\n";
        }
    }
    
    echo "\n✅ Direct insertion completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
