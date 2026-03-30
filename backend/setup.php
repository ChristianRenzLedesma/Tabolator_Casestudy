<?php
require_once 'config/database.php';

echo "Setting up Tabulator Database...\n";

try {
    $database = new Database();
    
    echo "✓ Database connection established\n";
    
    // Create tables
    $database->createTables();
    echo "✓ Database tables created successfully\n";
    
    // Seed with sample data
    $database->seedData();
    echo "✓ Sample data inserted successfully\n";
    
    echo "\n🎉 Database setup completed successfully!\n";
    echo "\nDatabase: tabulator_db\n";
    echo "Tables created:\n";
    echo "- categories (for competition categories)\n";
    echo "- criteria (for scoring criteria)\n";
    echo "- judges (for judge information)\n";
    echo "- contestants (for contestant data)\n";
    echo "- scores (for scoring results)\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. MySQL/MariaDB is running\n";
    echo "2. User 'root' has necessary privileges\n";
    echo "3. No conflicting database exists\n";
}
?>
