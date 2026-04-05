<?php
// Fix Database Issues - Complete Setup Script
// This will fix all database and API issues

echo "🔧 Starting Database Fix Process...\n\n";

// Step 1: Check if config/database.php exists
if (!file_exists('config/database.php')) {
    echo "❌ config/database.php not found!\n";
    echo "Please create the database configuration file first.\n";
    exit;
} else {
    echo "✅ config/database.php found\n";
}

// Step 2: Test database connection
try {
    require_once 'config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    echo "✅ Database connection successful\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "Please check your database configuration.\n";
    exit;
}

// Step 3: Check if tables exist
$tables_to_check = ['categories', 'criteria', 'judges', 'contestants'];
foreach ($tables_to_check as $table) {
    $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
    $exists = $stmt->fetch();
    
    if ($exists) {
        echo "✅ Table '$table' exists\n";
    } else {
        echo "❌ Table '$table' missing - Creating...\n";
        
        // Try to create basic table structure
        if ($table === 'categories') {
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
        }
    }
}

// Step 4: Check criteria table structure
echo "\n🔍 Checking criteria table structure...\n";
$stmt = $pdo->prepare("SHOW COLUMNS FROM criteria LIKE 'category_name'");
$stmt->execute();
$columnExists = $stmt->fetch();

if (!$columnExists) {
    echo "⚠️ category_name column missing - Adding...\n";
    
    try {
        // Add the column as nullable first
        $pdo->exec("ALTER TABLE criteria ADD COLUMN category_name VARCHAR(255) NULL AFTER category_id");
        echo "✅ category_name column added (nullable)\n";
        
        // Add index
        $pdo->exec("ALTER TABLE criteria ADD INDEX idx_category_name (category_name)");
        echo "✅ category_name index added\n";
        
        // Update existing records
        $stmt = $pdo->prepare("
            UPDATE criteria c 
            JOIN categories cat ON c.category_id = cat.id 
            SET c.category_name = cat.name 
            WHERE c.category_name IS NULL
        ");
        $stmt->execute();
        $updated = $stmt->rowCount();
        echo "✅ Updated {$updated} existing records\n";
        
        // Now make it NOT NULL (only if we have data)
        if ($updated > 0) {
            $pdo->exec("ALTER TABLE criteria MODIFY COLUMN category_name VARCHAR(255) NOT NULL");
            echo "✅ category_name column set to NOT NULL\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Error adding column: " . $e->getMessage() . "\n";
    }
} else {
    echo "✅ category_name column exists\n";
}

// Step 5: Insert sample data if tables are empty
echo "\n📊 Checking for sample data...\n";

$stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
$categoryCount = $stmt->fetch()['count'];

if ($categoryCount == 0) {
    echo "⚠️ No categories found - Inserting sample categories first...\n";
    
    $sampleCategories = [
        ['Talent', 'Performance and talent-based competitions'],
        ['Beauty', 'Physical appearance and poise evaluation'],
        ['Intelligence', 'IQ and knowledge-based assessment'],
        ['Poise', 'Grace, confidence, and stage presence']
    ];
    
    foreach ($sampleCategories as $category) {
        $stmt = $pdo->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        $stmt->execute($category);
    }
    echo "✅ Sample categories inserted\n";
    
    // Now get the actual category IDs
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY id");
    $categories = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    echo "✅ Retrieved category IDs for criteria insertion\n";
}

$stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
$criteriaCount = $stmt->fetch()['count'];

if ($criteriaCount == 0 && !empty($categories)) {
    echo "⚠️ No criteria found - Inserting sample data...\n";
    
    $sampleCriteria = [
        ['Talent', 'Performance Quality', 'Overall quality of performance', 40.00, 1.00, 10.00],
        ['Talent', 'Originality', 'Creativity and uniqueness', 30.00, 1.00, 10.00],
        ['Talent', 'Stage Presence', 'Confidence and stage command', 30.00, 1.00, 10.00],
        ['Beauty', 'Facial Features', 'Facial symmetry and features', 35.00, 1.00, 10.00],
        ['Beauty', 'Skin Complexion', 'Skin quality and complexion', 30.00, 1.00, 10.00],
        ['Beauty', 'Body Proportion', 'Body measurements and proportion', 35.00, 1.00, 10.00]
    ];
    
    foreach ($sampleCriteria as $criteria) {
        $categoryName = $criteria[0];
        $categoryId = array_search($categoryName, $categories);
        
        if ($categoryId === false) {
            echo "❌ Category '$categoryName' not found! Skipping criteria insertion.\n";
            continue;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO criteria (category_id, category_name, name, description, percentage, min_score, max_score) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $categoryId,   // category_id (actual ID from database)
            $categoryName, // category_name
            $criteria[1], // name
            $criteria[2], // description
            $criteria[3], // percentage
            $criteria[4], // min_score
            $criteria[5]  // max_score
        ]);
    }
    echo "✅ Sample criteria inserted\n";
}

// Step 6: Final verification
echo "\n🎯 Final Database Status:\n";

$stmt = $pdo->query("SELECT COUNT(*) as count FROM categories");
$categoryCount = $stmt->fetch()['count'];
echo "📊 Categories: {$categoryCount}\n";

$stmt = $pdo->query("SELECT COUNT(*) as count FROM criteria");
$criteriaCount = $stmt->fetch()['count'];
echo "📊 Criteria: {$criteriaCount}\n";

$stmt = $pdo->query("SELECT * FROM criteria LIMIT 3");
$records = $stmt->fetchAll();
echo "\n📋 Sample Criteria Records:\n";
foreach ($records as $record) {
    echo "ID: {$record['id']} - {$record['name']} (Category: {$record['category_name']})\n";
}

echo "\n✅ Database fix completed!\n";
echo "🌐 API should now work at: http://localhost/Tabolator_Casestudy/backend/api/criteria\n";
echo "🖥️ Test frontend at: http://localhost/Tabolator_Casestudy/frontend\n";
?>
