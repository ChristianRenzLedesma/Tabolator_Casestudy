-- =====================================================
-- TABULATOR SYSTEM DATABASE SCHEMA
-- =====================================================
-- Database: tabulator_db
-- Engine: MySQL/MariaDB
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS `tabulator_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tabulator_db`;

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: categories
-- Stores competition categories
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: criteria
-- Stores scoring criteria for each category
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `criteria` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `category_name` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `percentage` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
    `min_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
    `max_score` DECIMAL(5,2) NOT NULL DEFAULT '10.00',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: judges
-- Stores judge information and authentication
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `judges` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `pin` VARCHAR(4) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_pin` (`pin`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: contestants
-- Stores contestant information and status
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `contestants` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `contestant_number` INT(11) NULL,
    `age` INT(3) NULL,
    `gender` ENUM('Male', 'Female', 'Other') NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `status` ENUM('Active', 'Eliminated', 'Disqualified', 'Winner') NOT NULL DEFAULT 'Active',
    `final_score` DECIMAL(8,2) NULL DEFAULT '0.00',
    `rank` INT(11) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_rank` (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: scores
-- Stores judge scores for contestants
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scores` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `contestant_id` INT(11) NOT NULL,
    `judge_id` INT(11) NOT NULL,
    `criterion_id` INT(11) NOT NULL,
    `score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
    `comments` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`criterion_id`) REFERENCES `criteria`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_score` (`contestant_id`, `judge_id`, `criterion_id`),
    INDEX `idx_contestant_judge` (`contestant_id`, `judge_id`),
    INDEX `idx_criterion` (`criterion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: events
-- Stores competition events/rounds
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `event_date` DATE NULL,
    `venue` VARCHAR(255) NULL,
    `status` ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: event_contestants
-- Links contestants to events (many-to-many)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `event_contestants` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `event_id` INT(11) NOT NULL,
    `contestant_id` INT(11) NOT NULL,
    `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`contestant_id`) REFERENCES `contestants`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_event_contestant` (`event_id`, `contestant_id`),
    INDEX `idx_event_id` (`event_id`),
    INDEX `idx_contestant_id` (`contestant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS
-- =====================================================

-- -----------------------------------------------------
-- View: contestant_scores_summary
-- Aggregates scores for each contestant
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `contestant_scores_summary` AS
SELECT 
    c.id as contestant_id,
    c.name as contestant_name,
    c.status,
    c.final_score,
    c.rank,
    cat.name as category_name,
    COUNT(DISTINCT s.judge_id) as judges_count,
    COUNT(s.id) as total_scores,
    AVG(s.score) as average_score,
    MAX(s.score) as highest_score,
    MIN(s.score) as lowest_score
FROM contestants c
LEFT JOIN scores s ON c.id = s.contestant_id
LEFT JOIN criteria crit ON s.criterion_id = crit.id
LEFT JOIN categories cat ON crit.category_id = cat.id
GROUP BY c.id, c.name, c.status, c.final_score, c.rank, cat.name;

-- -----------------------------------------------------
-- View: criteria_by_category
-- Shows criteria grouped by category with total percentages
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `criteria_by_category` AS
SELECT 
    cat.id as category_id,
    cat.name as category_name,
    COUNT(crit.id) as criteria_count,
    SUM(crit.percentage) as total_percentage
FROM categories cat
LEFT JOIN criteria crit ON cat.id = crit.category_id
GROUP BY cat.id, cat.name;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- Trigger: update_contestant_final_score
-- Updates final score when scores change
-- -----------------------------------------------------
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `update_contestant_final_score`
AFTER INSERT ON `scores`
FOR EACH ROW
BEGIN
    UPDATE contestants 
    SET final_score = (
        SELECT SUM(score * (percentage / 100))
        FROM scores s
        JOIN criteria c ON s.criterion_id = c.id
        WHERE s.contestant_id = NEW.contestant_id
    )
    WHERE id = NEW.contestant_id;
END//
DELIMITER ;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT IGNORE INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Talent', 'Performance and talent-based competitions'),
(2, 'Beauty', 'Physical appearance and poise evaluation'),
(3, 'Intelligence', 'IQ and knowledge-based assessment'),
(4, 'Poise', 'Grace, confidence, and stage presence');

-- Insert sample criteria
INSERT IGNORE INTO `criteria` (`id`, `category_id`, `name`, `description`, `percentage`, `min_score`, `max_score`) VALUES
(1, 1, 'Performance Quality', 'Overall quality of performance', 40.00, 1.00, 10.00),
(2, 1, 'Originality', 'Creativity and uniqueness', 30.00, 1.00, 10.00),
(3, 1, 'Stage Presence', 'Confidence and stage command', 30.00, 1.00, 10.00),
(4, 2, 'Facial Features', 'Facial symmetry and features', 35.00, 1.00, 10.00),
(5, 2, 'Skin Complexion', 'Skin quality and complexion', 30.00, 1.00, 10.00),
(6, 2, 'Body Proportion', 'Body measurements and proportion', 35.00, 1.00, 10.00),
(7, 3, 'Intelligence', 'General intelligence assessment', 50.00, 1.00, 10.00),
(8, 3, 'Communication', 'Verbal and communication skills', 50.00, 1.00, 10.00),
(9, 4, 'Poise', 'Overall poise and grace', 40.00, 1.00, 10.00),
(10, 4, 'Confidence', 'Self-confidence and composure', 60.00, 1.00, 10.00);

-- Insert sample judges
INSERT IGNORE INTO `judges` (`id`, `name`, `email`, `pin`, `is_active`) VALUES
(1, 'Dr. Maria Santos', 'maria.santos@tabulator.com', '2847', 1),
(2, 'Prof. John Reyes', 'john.reyes@tabulator.com', '9156', 1),
(3, 'Ms. Anna Cruz', 'anna.cruz@tabulator.com', '3729', 1),
(4, 'Mr. David Lee', 'david.lee@tabulator.com', '6481', 1);

-- Insert sample contestants
INSERT IGNORE INTO `contestants` (`id`, `name`, `contestant_number`, `age`, `gender`, `status`) VALUES
(1, 'Sarah Martinez', 1, 22, 'Female', 'Active'),
(2, 'Jessica Chen', 2, 24, 'Female', 'Active'),
(3, 'Emily Rodriguez', 3, 21, 'Female', 'Eliminated'),
(4, 'Amanda Thompson', 4, 23, 'Female', 'Active'),
(5, 'Rachel Kim', 5, 25, 'Female', 'Disqualified'),
(6, 'Michelle Garcia', 6, 22, 'Female', 'Active');

-- Insert sample event
INSERT IGNORE INTO `events` (`id`, `name`, `description`, `event_date`, `venue`, `status`) VALUES
(1, 'Annual Talent Competition 2024', 'Main annual competition featuring all categories', '2024-12-15', 'Convention Center', 'Upcoming');

-- Link contestants to event
INSERT IGNORE INTO `event_contestants` (`event_id`, `contestant_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS `idx_contestants_name` ON `contestants` (`name`);
CREATE INDEX IF NOT EXISTS `idx_judges_name` ON `judges` (`name`);
CREATE INDEX IF NOT EXISTS `idx_criteria_name` ON `criteria` (`name`);
CREATE INDEX IF NOT EXISTS `idx_categories_name` ON `categories` (`name`);
CREATE INDEX IF NOT EXISTS `idx_scores_score` ON `scores` (`score`);
CREATE INDEX IF NOT EXISTS `idx_events_name` ON `events` (`name`);

-- =====================================================
-- DATABASE DOCUMENTATION
-- =====================================================

/*
RELATIONSHIPS:
--------------
1. categories (1) -> criteria (many)
   - Each category can have multiple criteria
   - Criteria percentage should sum to 100% per category

2. contestants (1) -> scores (many)
   - Each contestant can have multiple scores
   - Scores are linked to specific criteria and judges

3. judges (1) -> scores (many)
   - Each judge can give multiple scores
   - Judges have unique 4-digit PINs for authentication

4. criteria (1) -> scores (many)
   - Each criterion can have multiple scores
   - Each score links contestant, judge, and criterion

5. events (1) -> event_contestants (many)
   - Each event can have multiple contestants
   - Many-to-many relationship through junction table

BUSINESS RULES:
----------------
1. Contestant status: Active, Eliminated, Disqualified, Winner
2. Judge PINs must be unique 4-digit codes
3. Criteria percentages should sum to 100% per category
4. Each judge can score each contestant only once per criterion
5. Scores range from min_score to max_score defined in criteria
6. Events can be Upcoming, Ongoing, Completed, or Cancelled

SECURITY CONSIDERATIONS:
------------------------
1. PIN validation for judge authentication
2. Input validation for score ranges
3. Audit trail through created_at/updated_at timestamps
4. Foreign key constraints prevent orphaned records
5. Unique constraints prevent duplicate data
*/
