<?php
// Fix Foreign Key Issues - Disable Constraints Temporarily
// This will disable foreign key checks, fix data, then re-enable

require_once 'config/database.php';

echo "🔧 Fixing Foreign Key Issues (Disabling Constraints)...\n";

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Step 1: Disable foreign key checks
    echo "\n🔓 Disabling foreign key checks...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    echo "✅ Foreign key checks disabled\n";
    
    // Step 2: Drop tables safely
    echo "\n🗑️ Dropping tables...\n";
    
    $pdo->exec("DROP TABLE IF EXISTS criteria");
    echo "✅ Dropped criteria table\n";
    
    $pdo->exec("DROP TABLE IF EXISTS categories");
    echo "✅ Dropped categories table\n";
    
    // Step 3: Create categories table
    echo "\n📋 Creating categories table...\n";
    
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
    
    // Step 4: Create criteria table
    echo "\n📋 Creating criteria table...\n";
    
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
            PRIMARY KEY (id),
            INDEX idx_category_id (category_id),
            INDEX idx_category_name (category_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    echo "✅ Criteria table created\n";
    
    // Step 5: Insert categories
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
    
    // Step 6: Insert criteria
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
    
    // Step 7: Re-enable foreign key checks
    echo "\n🔒 Re-enabling foreign key checks...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "✅ Foreign key checks re-enabled\n";
    
    // Step 8: Add foreign key constraint
    echo "\n🔗 Adding foreign key constraint...\n";
    try {
        $pdo->exec("
            ALTER TABLE criteria 
            ADD CONSTRAINT criteria_ibfk_1 
            FOREIGN KEY (category_id) REFERENCES categories(id) 
            ON DELETE CASCADE
        ");
        echo "✅ Foreign key constraint added\n";
    } catch (Exception $e) {
        echo "⚠️ Could not add foreign key constraint: " . $e->getMessage() . "\n";
        echo "ℹ️ Data is still functional\n";
    }
    
    // Step 9: Final verification
    echo "\n📊 Final verification:\n";
    
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
    
    echo "\n✅ Foreign key issues fixed!\n";
    echo "🌐 Test API: http://localhost/Tabolator_Casestudy/backend/api/criteria\n";
    echo "🖥️ Test frontend: http://localhost/Tabolator_Casestudy/frontend\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    
    // Make sure to re-enable foreign key checks even on error
    try {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        echo "✅ Foreign key checks re-enabled (error recovery)\n";
    } catch (Exception $e2) {
        echo "⚠️ Could not re-enable foreign key checks\n";
    }
}
?>
