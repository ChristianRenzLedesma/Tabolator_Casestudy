<?php

class Database {
    private $host = 'localhost';
    private $dbname = 'tabulator_db';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    private $pdo;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            // If database doesn't exist, try to create it
            if ($e->getCode() == 1049) {
                $this->createDatabase();
                $this->connect();
            } else {
                throw new PDOException($e->getMessage(), (int)$e->getCode());
            }
        }
    }

    private function createDatabase() {
        try {
            $dsn = "mysql:host={$this->host};charset={$this->charset}";
            $pdo = new PDO($dsn, $this->username, $this->password);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS {$this->dbname} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (PDOException $e) {
            throw new PDOException("Failed to create database: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function createTables() {
        try {
            $pdo = $this->getConnection();

            // Categories table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");

            // Criteria table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS criteria (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    percentage DECIMAL(5,2) NOT NULL,
                    min_score INT NOT NULL,
                    max_score INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                )
            ");

            // Judges table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS judges (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    pin VARCHAR(4) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");

            // Contestants table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS contestants (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    status ENUM('Active', 'Eliminated', 'Disqualified') DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");

            // Scores table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS scores (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    contestant_id INT NOT NULL,
                    judge_id INT NOT NULL,
                    criterion_id INT NOT NULL,
                    score DECIMAL(5,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (contestant_id) REFERENCES contestants(id) ON DELETE CASCADE,
                    FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
                    FOREIGN KEY (criterion_id) REFERENCES criteria(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_score (contestant_id, judge_id, criterion_id)
                )
            ");

            return true;
        } catch (PDOException $e) {
            throw new PDOException("Failed to create tables: " . $e->getMessage());
        }
    }

    public function seedData() {
        try {
            $pdo = $this->getConnection();

            // Insert sample categories
            $categories = [
                ['Talent'],
                ['Beauty'],
                ['Intelligence'],
                ['Poise']
            ];

            $stmt = $pdo->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
            foreach ($categories as $category) {
                $stmt->execute($category);
            }

            // Get category IDs
            $categoryIds = [];
            $result = $pdo->query("SELECT id, name FROM categories");
            while ($row = $result->fetch()) {
                $categoryIds[$row['name']] = $row['id'];
            }

            // Insert sample criteria
            $criteria = [
                [$categoryIds['Talent'], 'Performance Quality', 40.00, 1, 10],
                [$categoryIds['Talent'], 'Originality', 30.00, 1, 10],
                [$categoryIds['Talent'], 'Stage Presence', 30.00, 1, 10],
                [$categoryIds['Beauty'], 'Facial Features', 35.00, 1, 10],
                [$categoryIds['Beauty'], 'Skin Complexion', 30.00, 1, 10],
                [$categoryIds['Beauty'], 'Body Proportion', 35.00, 1, 10]
            ];

            $stmt = $pdo->prepare("INSERT IGNORE INTO criteria (category_id, name, percentage, min_score, max_score) VALUES (?, ?, ?, ?, ?)");
            foreach ($criteria as $criterion) {
                $stmt->execute($criterion);
            }

            // Insert sample judges
            $judges = [
                ['Dr. Maria Santos', '2847'],
                ['Prof. John Reyes', '9156'],
                ['Ms. Anna Cruz', '3729'],
                ['Mr. David Lee', '6481']
            ];

            $stmt = $pdo->prepare("INSERT IGNORE INTO judges (name, pin) VALUES (?, ?)");
            foreach ($judges as $judge) {
                $stmt->execute($judge);
            }

            // Insert sample contestants
            $contestants = [
                ['Sarah Martinez', 'Active'],
                ['Jessica Chen', 'Active'],
                ['Emily Rodriguez', 'Eliminated'],
                ['Amanda Thompson', 'Active'],
                ['Rachel Kim', 'Disqualified'],
                ['Michelle Garcia', 'Active']
            ];

            $stmt = $pdo->prepare("INSERT IGNORE INTO contestants (name, status) VALUES (?, ?)");
            foreach ($contestants as $contestant) {
                $stmt->execute($contestant);
            }

            return true;
        } catch (PDOException $e) {
            throw new PDOException("Failed to seed data: " . $e->getMessage());
        }
    }
}
