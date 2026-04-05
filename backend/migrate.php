<?php
// Database Migration Script
// Run this file to migrate the criteria table

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "Starting migration...\n";
    
    // Step 1: Check if column already exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM criteria LIKE 'category_name'");
    $stmt->execute();
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo "Column 'category_name' already exists. Skipping column addition.\n";
    } else {
        // Step 2: Add the category_name column
        echo "Adding category_name column...\n";
        $pdo->exec("ALTER TABLE criteria ADD COLUMN category_name VARCHAR(255) NOT NULL DEFAULT '' AFTER category_id");
        echo "✓ Column added successfully\n";
    }
    
    // Step 3: Add index
    echo "Adding index for category_name...\n";
    try {
        $pdo->exec("ALTER TABLE criteria ADD INDEX idx_category_name (category_name)");
        echo "✓ Index added successfully\n";
    } catch (Exception $e) {
        echo "⚠ Index may already exist: " . $e->getMessage() . "\n";
    }
    
    // Step 4: Update existing records
    echo "Updating existing records with category names...\n";
    $stmt = $pdo->prepare("
        UPDATE criteria c 
        JOIN categories cat ON c.category_id = cat.id 
        SET c.category_name = cat.name 
        WHERE c.category_name = '' OR c.category_name IS NULL
    ");
    $result = $stmt->execute();
    $updated = $stmt->rowCount();
    echo "✓ Updated {$updated} records\n";
    
    // Step 5: Verify migration
    echo "\n=== VERIFICATION ===\n";
    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.category_id,
            c.category_name,
            cat.name as expected_name,
            CASE 
                WHEN c.category_name = cat.name THEN '✓ OK'
                ELSE '✗ MISMATCH'
            END as status
        FROM criteria c
        JOIN categories cat ON c.category_id = cat.id
        ORDER BY c.id
        LIMIT 10
    ");
    $stmt->execute();
    $records = $stmt->fetchAll();
    
    echo "Sample records:\n";
    foreach ($records as $record) {
        echo "ID: {$record['id']} - Category: {$record['category_name']} - Status: {$record['status']}\n";
    }
    
    // Step 6: Show table structure
    echo "\n=== TABLE STRUCTURE ===\n";
    $stmt = $pdo->prepare("DESCRIBE criteria");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    
    foreach ($columns as $column) {
        echo "{$column['Field']} | {$column['Type']} | {$column['Null']} | {$column['Key']}\n";
    }
    
    echo "\n✅ Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
}
?>
