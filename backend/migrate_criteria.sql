-- Migration Script: Add category_name to criteria table
-- Run this script to update your existing database structure

-- Step 1: Add the category_name column
ALTER TABLE `criteria` 
ADD COLUMN `category_name` VARCHAR(255) NOT NULL DEFAULT '' AFTER `category_id`;

-- Step 2: Add index for better performance
ALTER TABLE `criteria` 
ADD INDEX `idx_category_name` (`category_name`);

-- Step 3: Update existing records with category names
UPDATE `criteria` c
JOIN `categories` cat ON c.category_id = cat.id
SET c.category_name = cat.name
WHERE c.category_name = '' OR c.category_name IS NULL;

-- Step 4: Verify the migration
SELECT 
    c.id,
    c.category_id,
    c.category_name,
    cat.name as expected_name,
    CASE 
        WHEN c.category_name = cat.name THEN 'OK'
        ELSE 'MISMATCH'
    END as status
FROM `criteria` c
JOIN `categories` cat ON c.category_id = cat.id
ORDER BY c.id;

-- Step 5: Show the updated table structure
DESCRIBE `criteria`;
