-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 05, 2026 at 04:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tabulator_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Talent', 'Performance and talent-based competitions', '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(3, 'Intelligence', 'IQ and knowledge-based assessment', '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(4, 'Poise', 'Grace, confidence, and stage presence', '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(5, 'Swimwear', NULL, '2026-04-04 14:09:59', '2026-04-04 14:09:59'),
(7, 'Beauty', NULL, '2026-04-05 07:27:28', '2026-04-05 07:27:28'),
(9, 'Q&A', NULL, '2026-04-05 10:31:54', '2026-04-05 10:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `contestants`
--

CREATE TABLE `contestants` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contestant_number` int(11) DEFAULT NULL,
  `age` int(3) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('Active','Eliminated','Disqualified','Winner') NOT NULL DEFAULT 'Active',
  `final_score` decimal(8,2) DEFAULT 0.00,
  `rank` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contestants`
--

INSERT INTO `contestants` (`id`, `name`, `contestant_number`, `age`, `gender`, `address`, `phone`, `email`, `status`, `final_score`, `rank`, `created_at`, `updated_at`) VALUES
(26, 'Renz Ledesma', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', 0.00, NULL, '2026-04-05 07:06:56', '2026-04-05 07:24:57'),
(27, 'Ronald Concepcion', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', 0.00, NULL, '2026-04-05 10:30:25', '2026-04-05 10:30:25');

-- --------------------------------------------------------

--
-- Stand-in structure for view `contestant_scores_summary`
-- (See below for the actual view)
--
CREATE TABLE `contestant_scores_summary` (
`contestant_id` int(11)
,`contestant_name` varchar(255)
,`status` enum('Active','Eliminated','Disqualified','Winner')
,`final_score` decimal(8,2)
,`rank` int(11)
,`category_name` varchar(255)
,`judges_count` bigint(21)
,`total_scores` bigint(21)
,`average_score` decimal(9,6)
,`highest_score` decimal(5,2)
,`lowest_score` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `criteria`
--

CREATE TABLE `criteria` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `min_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `max_score` decimal(5,2) NOT NULL DEFAULT 10.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `criteria`
--

INSERT INTO `criteria` (`id`, `category_id`, `category_name`, `name`, `description`, `percentage`, `min_score`, `max_score`, `created_at`, `updated_at`) VALUES
(1, 1, 'Talent', 'Performance Quality', 'Overall quality of performance', 40.00, 0.00, 100.00, '2026-04-04 14:00:45', '2026-04-05 07:04:43'),
(2, 1, 'Talent', 'Originality', 'Creativity and uniqueness', 30.00, 0.00, 100.00, '2026-04-04 14:00:45', '2026-04-05 10:42:17'),
(3, 1, 'Talent', 'Stage Presence', 'Confidence and stage command', 30.00, 0.00, 100.00, '2026-04-04 14:00:45', '2026-04-05 07:05:14'),
(7, 3, 'Intelligence', 'General Knowledge', 'Breadth of knowledge', 35.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(8, 3, 'Intelligence', 'Problem Solving', 'Analytical thinking', 35.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(9, 3, 'Intelligence', 'Communication', 'Verbal and written skills', 30.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(10, 4, 'Poise', 'Confidence', 'Self-assurance and poise', 40.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(11, 4, 'Poise', 'Grace', 'Elegance and movement', 30.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(12, 4, 'Poise', 'Stage Presence', 'Command of the stage', 30.00, 1.00, 10.00, '2026-04-04 14:00:45', '2026-04-04 14:00:45'),
(14, 5, 'Swimwear', 'Confidence', 'Criteria for Confidence in category ID 5', 35.00, 1.00, 10.00, '2026-04-04 14:10:52', '2026-04-04 14:10:52'),
(17, 9, 'Q&A', 'criteria', 'Criteria for criteria in category ID 9', 30.00, 0.00, 100.00, '2026-04-05 11:15:28', '2026-04-05 11:15:28'),
(18, 7, 'Beauty', 'criterias', 'Criteria for criterias in category ID 7', 40.00, 0.00, 100.00, '2026-04-05 11:16:22', '2026-04-05 11:16:22');

-- --------------------------------------------------------

--
-- Stand-in structure for view `criteria_by_category`
-- (See below for the actual view)
--
CREATE TABLE `criteria_by_category` (
`category_id` int(11)
,`category_name` varchar(255)
,`criteria_count` bigint(21)
,`total_percentage` decimal(27,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `status` enum('Upcoming','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `name`, `description`, `event_date`, `venue`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Annual Talent Competition 2024', 'Main annual competition featuring all categories', '2024-12-15', 'Convention Center', 'Upcoming', '2026-03-30 10:08:53', '2026-03-30 10:08:53');

-- --------------------------------------------------------

--
-- Table structure for table `event_contestants`
--

CREATE TABLE `event_contestants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `contestant_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `judges`
--

CREATE TABLE `judges` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pin` varchar(4) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `judges`
--

INSERT INTO `judges` (`id`, `name`, `email`, `phone`, `pin`, `is_active`, `created_at`, `updated_at`) VALUES
(13, 'Christian', NULL, NULL, '9582', 1, '2026-04-04 08:34:09', '2026-04-05 07:17:40'),
(14, 'Renz', NULL, NULL, '7163', 1, '2026-04-04 17:16:11', '2026-04-05 07:22:08'),
(15, 'Jefferson', NULL, NULL, '8546', 1, '2026-04-05 10:40:59', '2026-04-05 10:40:59');

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `contestant_id` int(11) NOT NULL,
  `judge_id` int(11) NOT NULL,
  `criterion_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `scores`
--
DELIMITER $$
CREATE TRIGGER `update_contestant_final_score` AFTER INSERT ON `scores` FOR EACH ROW BEGIN
    UPDATE contestants 
    SET final_score = (
        SELECT SUM(score * (percentage / 100))
        FROM scores s
        JOIN criteria c ON s.criterion_id = c.id
        WHERE s.contestant_id = NEW.contestant_id
    )
    WHERE id = NEW.contestant_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure for view `contestant_scores_summary`
--
DROP TABLE IF EXISTS `contestant_scores_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `contestant_scores_summary`  AS SELECT `c`.`id` AS `contestant_id`, `c`.`name` AS `contestant_name`, `c`.`status` AS `status`, `c`.`final_score` AS `final_score`, `c`.`rank` AS `rank`, `cat`.`name` AS `category_name`, count(distinct `s`.`judge_id`) AS `judges_count`, count(`s`.`id`) AS `total_scores`, avg(`s`.`score`) AS `average_score`, max(`s`.`score`) AS `highest_score`, min(`s`.`score`) AS `lowest_score` FROM (((`contestants` `c` left join `scores` `s` on(`c`.`id` = `s`.`contestant_id`)) left join `criteria` `crit` on(`s`.`criterion_id` = `crit`.`id`)) left join `categories` `cat` on(`crit`.`category_id` = `cat`.`id`)) GROUP BY `c`.`id`, `c`.`name`, `c`.`status`, `c`.`final_score`, `c`.`rank`, `cat`.`name` ;

-- --------------------------------------------------------

--
-- Structure for view `criteria_by_category`
--
DROP TABLE IF EXISTS `criteria_by_category`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `criteria_by_category`  AS SELECT `cat`.`id` AS `category_id`, `cat`.`name` AS `category_name`, count(`crit`.`id`) AS `criteria_count`, sum(`crit`.`percentage`) AS `total_percentage` FROM (`categories` `cat` left join `criteria` `crit` on(`cat`.`id` = `crit`.`category_id`)) GROUP BY `cat`.`id`, `cat`.`name` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name` (`name`);

--
-- Indexes for table `contestants`
--
ALTER TABLE `contestants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_rank` (`rank`),
  ADD KEY `idx_contestants_name` (`name`);

--
-- Indexes for table `criteria`
--
ALTER TABLE `criteria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_category_name` (`category_name`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date` (`event_date`),
  ADD KEY `idx_events_name` (`name`);

--
-- Indexes for table `event_contestants`
--
ALTER TABLE `event_contestants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_contestant` (`event_id`,`contestant_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_contestant_id` (`contestant_id`);

--
-- Indexes for table `judges`
--
ALTER TABLE `judges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pin` (`pin`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_judges_name` (`name`);

--
-- Indexes for table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_score` (`contestant_id`,`judge_id`,`criterion_id`),
  ADD KEY `judge_id` (`judge_id`),
  ADD KEY `idx_contestant_judge` (`contestant_id`,`judge_id`),
  ADD KEY `idx_criterion` (`criterion_id`),
  ADD KEY `idx_scores_score` (`score`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contestants`
--
ALTER TABLE `contestants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `criteria`
--
ALTER TABLE `criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event_contestants`
--
ALTER TABLE `event_contestants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `judges`
--
ALTER TABLE `judges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `criteria`
--
ALTER TABLE `criteria`
  ADD CONSTRAINT `criteria_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_contestants`
--
ALTER TABLE `event_contestants`
  ADD CONSTRAINT `event_contestants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_contestants_ibfk_2` FOREIGN KEY (`contestant_id`) REFERENCES `contestants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`contestant_id`) REFERENCES `contestants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`judge_id`) REFERENCES `judges` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scores_ibfk_3` FOREIGN KEY (`criterion_id`) REFERENCES `criteria` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
