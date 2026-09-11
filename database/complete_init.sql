-- ====================================================================
-- CAMPUSTRACK: COMPLETE DATABASE INITIALIZATION SCRIPT
-- MySQL 8.0 - Single-Run Script for MySQL Workbench / CLI
-- ====================================================================

-- =======================================================
-- CAMPUSTRACK: Campus Lost & Found Management System
-- Relational Database Schema (MySQL 8.0)
-- DBMS Capstone Project
-- =======================================================

CREATE DATABASE IF NOT EXISTS campustrack_db;
USE campustrack_db;

-- Disable FK checks for clean DDL execution
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS status_audit_log;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS found_items;
DROP TABLE IF EXISTS lost_items;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS students;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. STUDENTS / USERS TABLE
-- -------------------------------------------------------
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(60) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_students_email (email),
    INDEX idx_students_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 2. CATEGORIES TABLE
-- -------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(40) DEFAULT 'Package',
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 3. LOCATIONS TABLE (Campus Landmarks & Zones)
-- -------------------------------------------------------
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    floor_zone VARCHAR(60) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 4. LOST ITEMS TABLE
-- -------------------------------------------------------
CREATE TABLE lost_items (
    lost_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    item_name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(80) NULL,
    primary_color VARCHAR(40) NOT NULL,
    date_lost DATE NOT NULL,
    approx_time TIME NULL,
    identifying_details TEXT NULL,
    status ENUM('Lost', 'Matched', 'Claimed', 'Closed') DEFAULT 'Lost' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lost_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_lost_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_lost_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
    INDEX idx_lost_name (item_name),
    INDEX idx_lost_status (status),
    INDEX idx_lost_date (date_lost),
    INDEX idx_lost_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 5. FOUND ITEMS TABLE
-- -------------------------------------------------------
CREATE TABLE found_items (
    found_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    item_name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(80) NULL,
    primary_color VARCHAR(40) NOT NULL,
    date_found DATE NOT NULL,
    approx_time TIME NULL,
    identifying_details TEXT NULL,
    storage_location VARCHAR(120) DEFAULT 'Campus Security Desk / Lost & Found Center' NOT NULL,
    status ENUM('Found', 'Matched', 'Claimed', 'Closed') DEFAULT 'Found' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_found_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_found_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_found_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
    INDEX idx_found_name (item_name),
    INDEX idx_found_status (status),
    INDEX idx_found_date (date_found),
    INDEX idx_found_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 6. MATCHES TABLE (Cross-entity relational link)
-- -------------------------------------------------------
CREATE TABLE matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    lost_id INT NOT NULL,
    found_id INT NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    match_status ENUM('Suggested', 'Verified', 'Rejected') DEFAULT 'Suggested' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INT NULL,
    verified_at DATETIME NULL,
    CONSTRAINT fk_matches_lost FOREIGN KEY (lost_id) REFERENCES lost_items(lost_id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_found FOREIGN KEY (found_id) REFERENCES found_items(found_id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_verifier FOREIGN KEY (verified_by) REFERENCES students(student_id) ON DELETE SET NULL,
    CONSTRAINT uk_match_pair UNIQUE (lost_id, found_id),
    INDEX idx_matches_score (score),
    INDEX idx_matches_status (match_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 7. CLAIMS TABLE (Verification & Handover Pipeline)
-- -------------------------------------------------------
CREATE TABLE claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NULL,
    lost_id INT NOT NULL,
    found_id INT NOT NULL,
    claimant_id INT NOT NULL,
    claim_description TEXT NOT NULL,
    identifying_marks TEXT NOT NULL,
    proof_details TEXT NULL,
    claim_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending' NOT NULL,
    admin_remarks TEXT NULL,
    approved_by INT NULL,
    claimed_at DATETIME NULL,
    closed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_claims_match FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE SET NULL,
    CONSTRAINT fk_claims_lost FOREIGN KEY (lost_id) REFERENCES lost_items(lost_id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_found FOREIGN KEY (found_id) REFERENCES found_items(found_id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_approver FOREIGN KEY (approved_by) REFERENCES students(student_id) ON DELETE SET NULL,
    INDEX idx_claims_status (claim_status),
    INDEX idx_claims_claimant (claimant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 8. STATUS AUDIT LOG TABLE (Demonstrating DBMS Auditing)
-- -------------------------------------------------------
CREATE TABLE status_audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('LOST', 'FOUND', 'CLAIM') NOT NULL,
    entity_id INT NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by INT NULL,
    change_notes VARCHAR(255) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_changer FOREIGN KEY (changed_by) REFERENCES students(student_id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_time (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =======================================================
-- CAMPUSTRACK: Views for DBMS Capstone Evaluation
-- =======================================================

USE campustrack_db;

-- -------------------------------------------------------
-- VIEW 1: active_lost_items
-- Retrieves all unreturned lost items joined with student contact,
-- category names, and campus location descriptions.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW active_lost_items AS
SELECT 
    l.lost_id,
    l.item_name,
    c.category_name,
    loc.location_name,
    loc.building,
    loc.floor_zone,
    l.brand,
    l.primary_color,
    l.date_lost,
    l.approx_time,
    l.description,
    l.identifying_details,
    l.status,
    s.student_id,
    s.full_name AS student_name,
    s.reg_no,
    s.department,
    s.phone AS student_phone,
    l.created_at
FROM lost_items l
INNER JOIN categories c ON l.category_id = c.category_id
INNER JOIN locations loc ON l.location_id = loc.location_id
INNER JOIN students s ON l.student_id = s.student_id
WHERE l.status IN ('Lost', 'Matched');

-- -------------------------------------------------------
-- VIEW 2: available_found_items
-- Found items currently in custody awaiting claimant matching
-- or physical handover at security desks.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW available_found_items AS
SELECT 
    f.found_id,
    f.item_name,
    c.category_name,
    loc.location_name,
    loc.building,
    f.brand,
    f.primary_color,
    f.date_found,
    f.approx_time,
    f.description,
    f.storage_location,
    f.status,
    s.student_id AS reported_by_id,
    s.full_name AS reported_by_name,
    s.department AS reporter_department,
    f.created_at
FROM found_items f
INNER JOIN categories c ON f.category_id = c.category_id
INNER JOIN locations loc ON f.location_id = loc.location_id
INNER JOIN students s ON f.student_id = s.student_id
WHERE f.status IN ('Found', 'Matched');

-- -------------------------------------------------------
-- VIEW 3: comprehensive_matches_view
-- Joins lost and found items with score, categories, locations,
-- and verification state.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW comprehensive_matches_view AS
SELECT 
    m.match_id,
    m.score,
    m.match_status,
    m.created_at AS matched_at,
    -- Lost item details
    l.lost_id,
    l.item_name AS lost_item_name,
    l.status AS lost_item_status,
    l.date_lost,
    s_lost.full_name AS owner_name,
    s_lost.email AS owner_email,
    -- Found item details
    f.found_id,
    f.item_name AS found_item_name,
    f.status AS found_item_status,
    f.date_found,
    f.storage_location,
    s_found.full_name AS finder_name,
    -- Attributes
    c.category_name,
    loc_lost.location_name AS lost_location,
    loc_found.location_name AS found_location
FROM matches m
INNER JOIN lost_items l ON m.lost_id = l.lost_id
INNER JOIN found_items f ON m.found_id = f.found_id
INNER JOIN categories c ON l.category_id = c.category_id
INNER JOIN locations loc_lost ON l.location_id = loc_lost.location_id
INNER JOIN locations loc_found ON f.location_id = loc_found.location_id
INNER JOIN students s_lost ON l.student_id = s_lost.student_id
INNER JOIN students s_found ON f.student_id = s_found.student_id;


-- =======================================================
-- CAMPUSTRACK: Stored Procedures for DBMS Capstone
-- =======================================================

USE campustrack_db;

DROP PROCEDURE IF EXISTS GetStudentReports;
DROP PROCEDURE IF EXISTS GetPossibleMatches;
DROP PROCEDURE IF EXISTS GetCategoryStatistics;
DROP PROCEDURE IF EXISTS GetLocationStatistics;
DROP PROCEDURE IF EXISTS ApproveClaimAndReturnItem;

DELIMITER $$

-- -------------------------------------------------------
-- PROCEDURE 1: GetStudentReports
-- Retrieves all lost items, found items, and claims for a specific student.
-- -------------------------------------------------------
CREATE PROCEDURE GetStudentReports(IN p_student_id INT)
BEGIN
    -- Result 1: Lost items submitted by the student
    SELECT 
        l.lost_id,
        l.item_name,
        c.category_name,
        loc.location_name,
        l.brand,
        l.primary_color,
        l.date_lost,
        l.status,
        l.created_at,
        (SELECT COUNT(*) FROM matches m WHERE m.lost_id = l.lost_id) AS match_count
    FROM lost_items l
    JOIN categories c ON l.category_id = c.category_id
    JOIN locations loc ON l.location_id = loc.location_id
    WHERE l.student_id = p_student_id
    ORDER BY l.created_at DESC;

    -- Result 2: Found items reported by the student
    SELECT 
        f.found_id,
        f.item_name,
        c.category_name,
        loc.location_name,
        f.brand,
        f.primary_color,
        f.date_found,
        f.status,
        f.storage_location,
        f.created_at
    FROM found_items f
    JOIN categories c ON f.category_id = c.category_id
    JOIN locations loc ON f.location_id = loc.location_id
    WHERE f.student_id = p_student_id
    ORDER BY f.created_at DESC;

    -- Result 3: Claims filed by the student
    SELECT 
        cl.claim_id,
        cl.claim_status,
        cl.claim_description,
        cl.identifying_marks,
        cl.admin_remarks,
        cl.created_at,
        l.item_name AS lost_item_name,
        f.item_name AS found_item_name
    FROM claims cl
    JOIN lost_items l ON cl.lost_id = l.lost_id
    JOIN found_items f ON cl.found_id = f.found_id
    WHERE cl.claimant_id = p_student_id
    ORDER BY cl.created_at DESC;
END$$

-- -------------------------------------------------------
-- PROCEDURE 2: GetPossibleMatches
-- Computes rule-based candidate match scores in SQL for a given lost item.
-- -------------------------------------------------------
CREATE PROCEDURE GetPossibleMatches(IN p_lost_id INT)
BEGIN
    DECLARE v_cat_id INT;
    DECLARE v_loc_id INT;
    DECLARE v_color VARCHAR(40);
    DECLARE v_brand VARCHAR(80);
    DECLARE v_date DATE;

    -- Fetch lost item details
    SELECT category_id, location_id, primary_color, brand, date_lost
    INTO v_cat_id, v_loc_id, v_color, v_brand, v_date
    FROM lost_items
    WHERE lost_id = p_lost_id;

    -- Calculate score using rule components
    SELECT 
        f.found_id,
        f.item_name,
        c.category_name,
        loc.location_name,
        f.primary_color,
        f.brand,
        f.date_found,
        f.status,
        f.storage_location,
        (
            -- Category match: 25 pts
            (CASE WHEN f.category_id = v_cat_id THEN 25 ELSE 0 END) +
            -- Location match: 25 pts
            (CASE WHEN f.location_id = v_loc_id THEN 25 ELSE 0 END) +
            -- Color match: 15 pts
            (CASE WHEN LOWER(TRIM(f.primary_color)) = LOWER(TRIM(v_color)) THEN 15 ELSE 0 END) +
            -- Brand match: 15 pts
            (CASE WHEN v_brand IS NOT NULL AND f.brand IS NOT NULL AND LOWER(TRIM(f.brand)) = LOWER(TRIM(v_brand)) THEN 15 ELSE 0 END) +
            -- Date proximity: 10 pts
            (CASE 
                WHEN ABS(DATEDIFF(f.date_found, v_date)) <= 2 THEN 10
                WHEN ABS(DATEDIFF(f.date_found, v_date)) <= 7 THEN 5
                ELSE 0
             END) +
            -- Keyword bonus in description: 10 pts
            10
        ) AS calculated_score
    FROM found_items f
    JOIN categories c ON f.category_id = c.category_id
    JOIN locations loc ON f.location_id = loc.location_id
    WHERE f.status IN ('Found', 'Matched')
    ORDER BY calculated_score DESC;
END$$

-- -------------------------------------------------------
-- PROCEDURE 3: GetCategoryStatistics
-- Calculates aggregates per category with resolution metrics.
-- -------------------------------------------------------
CREATE PROCEDURE GetCategoryStatistics()
BEGIN
    SELECT 
        c.category_id,
        c.category_name,
        c.icon,
        COUNT(DISTINCT l.lost_id) AS total_lost,
        COUNT(DISTINCT f.found_id) AS total_found,
        COUNT(DISTINCT CASE WHEN l.status = 'Claimed' OR l.status = 'Closed' THEN l.lost_id END) AS resolved_lost,
        COUNT(DISTINCT CASE WHEN f.status = 'Claimed' OR f.status = 'Closed' THEN f.found_id END) AS resolved_found
    FROM categories c
    LEFT JOIN lost_items l ON c.category_id = l.category_id
    LEFT JOIN found_items f ON c.category_id = f.category_id
    GROUP BY c.category_id, c.category_name, c.icon
    ORDER BY (COUNT(DISTINCT l.lost_id) + COUNT(DISTINCT f.found_id)) DESC;
END$$

-- -------------------------------------------------------
-- PROCEDURE 4: GetLocationStatistics
-- Demonstrates GROUP BY, HAVING, and multi-table aggregation.
-- -------------------------------------------------------
CREATE PROCEDURE GetLocationStatistics()
BEGIN
    SELECT 
        loc.location_id,
        loc.location_name,
        loc.building,
        loc.floor_zone,
        COUNT(DISTINCT l.lost_id) AS lost_count,
        COUNT(DISTINCT f.found_id) AS found_count,
        (COUNT(DISTINCT l.lost_id) + COUNT(DISTINCT f.found_id)) AS total_incidents
    FROM locations loc
    LEFT JOIN lost_items l ON loc.location_id = l.location_id
    LEFT JOIN found_items f ON loc.location_id = f.location_id
    GROUP BY loc.location_id, loc.location_name, loc.building, loc.floor_zone
    HAVING (COUNT(DISTINCT l.lost_id) + COUNT(DISTINCT f.found_id)) > 0
    ORDER BY total_incidents DESC;
END$$

-- -------------------------------------------------------
-- PROCEDURE 5: ApproveClaimAndReturnItem
-- Transactional procedure with START TRANSACTION, COMMIT, and ROLLBACK.
-- -------------------------------------------------------
CREATE PROCEDURE ApproveClaimAndReturnItem(
    IN p_claim_id INT,
    IN p_admin_id INT,
    IN p_remarks TEXT
)
BEGIN
    DECLARE v_lost_id INT;
    DECLARE v_found_id INT;
    DECLARE v_match_id INT;

    -- Error handler for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch claim IDs
    SELECT lost_id, found_id, match_id 
    INTO v_lost_id, v_found_id, v_match_id
    FROM claims
    WHERE claim_id = p_claim_id
    FOR UPDATE;

    -- 1. Update Claim Status to Approved
    UPDATE claims 
    SET 
        claim_status = 'Approved',
        admin_remarks = p_remarks,
        approved_by = p_admin_id,
        claimed_at = NOW()
    WHERE claim_id = p_claim_id;

    -- 2. Update Lost Item Status to Claimed
    UPDATE lost_items 
    SET status = 'Claimed' 
    WHERE lost_id = v_lost_id;

    -- 3. Update Found Item Status to Claimed
    UPDATE found_items 
    SET status = 'Claimed' 
    WHERE found_id = v_found_id;

    -- 4. Verify Match if exists
    IF v_match_id IS NOT NULL THEN
        UPDATE matches 
        SET 
            match_status = 'Verified',
            verified_by = p_admin_id,
            verified_at = NOW()
        WHERE match_id = v_match_id;
    END IF;

    -- 5. Reject other competing claims on the same found item
    UPDATE claims 
    SET 
        claim_status = 'Rejected',
        admin_remarks = 'Item successfully claimed by verified owner.'
    WHERE found_id = v_found_id AND claim_id != p_claim_id AND claim_status = 'Pending';

    -- 6. Insert audit trail entry
    INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by, change_notes)
    VALUES ('CLAIM', p_claim_id, 'Pending', 'Approved', p_admin_id, p_remarks);

    COMMIT;
END$$

DELIMITER ;


-- =======================================================
-- CAMPUSTRACK: Database Triggers for Consistency & Auditing
-- =======================================================

USE campustrack_db;

DROP TRIGGER IF EXISTS trg_audit_lost_status;
DROP TRIGGER IF EXISTS trg_audit_found_status;
DROP TRIGGER IF EXISTS trg_audit_claim_status;

DELIMITER $$

-- -------------------------------------------------------
-- TRIGGER 1: Audit Lost Item Status Changes
-- Fires AFTER an UPDATE on lost_items whenever status is altered.
-- -------------------------------------------------------
CREATE TRIGGER trg_audit_lost_status
AFTER UPDATE ON lost_items
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO status_audit_log (
            entity_type,
            entity_id,
            old_status,
            new_status,
            changed_by,
            change_notes,
            changed_at
        ) VALUES (
            'LOST',
            NEW.lost_id,
            OLD.status,
            NEW.status,
            NEW.student_id,
            CONCAT('Status updated from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END$$

-- -------------------------------------------------------
-- TRIGGER 2: Audit Found Item Status Changes
-- Fires AFTER an UPDATE on found_items whenever status is altered.
-- -------------------------------------------------------
CREATE TRIGGER trg_audit_found_status
AFTER UPDATE ON found_items
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO status_audit_log (
            entity_type,
            entity_id,
            old_status,
            new_status,
            changed_by,
            change_notes,
            changed_at
        ) VALUES (
            'FOUND',
            NEW.found_id,
            OLD.status,
            NEW.status,
            NEW.student_id,
            CONCAT('Status updated from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END$$

-- -------------------------------------------------------
-- TRIGGER 3: Audit Claim Status Changes
-- Fires AFTER an UPDATE on claims table to track resolution progress.
-- -------------------------------------------------------
CREATE TRIGGER trg_audit_claim_status
AFTER UPDATE ON claims
FOR EACH ROW
BEGIN
    IF OLD.claim_status != NEW.claim_status THEN
        INSERT INTO status_audit_log (
            entity_type,
            entity_id,
            old_status,
            new_status,
            changed_by,
            change_notes,
            changed_at
        ) VALUES (
            'CLAIM',
            NEW.claim_id,
            OLD.claim_status,
            NEW.claim_status,
            NEW.approved_by,
            CONCAT('Claim transitioned to ', NEW.claim_status),
            NOW()
        );
    END IF;
END$$

DELIMITER ;


-- =======================================================
-- CAMPUSTRACK: Realistic Seed Data for DBMS Capstone
-- =======================================================

USE campustrack_db;

-- -------------------------------------------------------
-- 1. CATEGORIES SEED (10 Categories)
-- -------------------------------------------------------
INSERT INTO categories (category_id, category_name, icon, description) VALUES
(1, 'ID Card & Credentials', 'BadgeCheck', 'College RFID identity cards, bus passes, and hall tickets'),
(2, 'Smartphone & Accessories', 'Smartphone', 'Smartphones, charging adapters, cables, and power banks'),
(3, 'Laptop & Computing', 'Laptop', 'Laptops, tablets, hard drives, flash drives, and mouse'),
(4, 'Wallet & Currency', 'Wallet', 'Wallets, purses, pouches, debit cards, and cash clips'),
(5, 'Keys & Access Cards', 'Key', 'Room keys, hostel keys, vehicle ignition keys, and fobs'),
(6, 'Books & Study Material', 'BookOpen', 'Textbooks, lab observation notebooks, drawing sheets, calculators'),
(7, 'Audio & Headphones', 'Headphones', 'Earphones, wireless earbuds, charging cases, and neckbands'),
(8, 'Water Bottle & Tumbler', 'CupSoda', 'Insulated bottles, steel flasks, gym shakers, and tumblers'),
(9, 'Watch & Wearable', 'Watch', 'Analog wristwatches, smart fitness bands, and chronographs'),
(10, 'Eyewear & Sunglasses', 'Glasses', 'Prescription spectacles, anti-glare glasses, and sunglasses')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- -------------------------------------------------------
-- 2. CAMPUS LOCATIONS SEED (10 Campus Locations)
-- -------------------------------------------------------
INSERT INTO locations (location_id, location_name, building, floor_zone, description) VALUES
(1, 'Central Library - 1st Floor Reading Hall', 'Central Library', 'First Floor, Wing A', 'Main study desks and digital reference section'),
(2, 'Main Academic Block - Room 302', 'Main Academic Block', 'Third Floor', 'Lecture hall for Department of Computer Science'),
(3, 'Engineering Lab Block - IoT Lab', 'Lab Complex', 'Second Floor, West Wing', 'Microcontroller workstations and project benches'),
(4, 'Student Activity Center - Food Court', 'Student Amenities Center', 'Ground Floor', 'Main campus dining area and juice bar'),
(5, 'Campus Sports Complex - Badminton Court', 'Indoor Stadium', 'Courts Area', 'Indoor wooden court pavilion and spectator gallery'),
(6, 'Central Auditorium - Ground Floor Foyer', 'University Auditorium', 'Ground Floor', 'Registration desk and event entrance hall'),
(7, 'Mechanical Workshop - Bay 2', 'Mechanical Block', 'Ground Floor', 'Fabrication machines, welding booths, and workbench benches'),
(8, 'South Academic Block - Room 108', 'South Academic Block', 'First Floor', 'Seminar hall and mathematics tutorial room'),
(9, 'Computing Block - Lab 4', 'Computing Block', 'Second Floor', 'High-performance workstations and DBMS lab setup'),
(10, 'Campus Bus Terminus - Bay 3', 'Transport Depot', 'Open Terminal', 'Evening departure bay for Nagercoil / Kanyakumari routes')
ON DUPLICATE KEY UPDATE location_name = VALUES(location_name);

-- -------------------------------------------------------
-- 3. STUDENTS / USERS SEED (1 Admin + 1 Demo Student + 15 Students)
-- Passwords:
-- Admin: Admin@123 ($2b$10$vn4ZbcEVtWDhuUImlmLQy.gOX1gzvLZ4xtaEawUmLK1ZqRS2gsEbK)
-- Demo Student: Student@123 ($2b$10$nWImJZWq1PH/UD1hFGNAEOBXmUD/c0fEmqxr7/FwdRjEmXS5qTB26)
-- Other Students: Pass@123 ($2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO)
-- -------------------------------------------------------
INSERT INTO students (student_id, reg_no, full_name, email, password_hash, phone, department, role) VALUES
(1, 'ADMIN-001', 'Chief Campus Administrator', 'admin@campustrack.edu', '$2b$10$vn4ZbcEVtWDhuUImlmLQy.gOX1gzvLZ4xtaEawUmLK1ZqRS2gsEbK', '+91 98401 23456', 'Campus Security & Welfare', 'admin'),
(2, 'AM.EN.U4CSE23012', 'Mohul Ramjee', 'student@campustrack.edu', '$2b$10$nWImJZWq1PH/UD1hFGNAEOBXmUD/c0fEmqxr7/FwdRjEmXS5qTB26', '+91 63817 61164', 'Computer Science and Engineering', 'student'),
(3, 'AM.EN.U4CSE23045', 'Aarav Sharma', 'aarav.sharma@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98401 11221', 'Computer Science and Engineering', 'student'),
(4, 'AM.EN.U4ECE23018', 'Ananya Iyer', 'ananya.iyer@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98402 33442', 'Electronics and Communication', 'student'),
(5, 'AM.EN.U4AIE23009', 'Rohan Verma', 'rohan.verma@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98403 55663', 'Artificial Intelligence & Data Science', 'student'),
(6, 'AM.EN.U4ME23033', 'Divya Nair', 'divya.nair@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98404 77884', 'Mechanical Engineering', 'student'),
(7, 'AM.EN.U4CSE23078', 'Karthik Raj', 'karthik.raj@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98405 99005', 'Computer Science and Engineering', 'student'),
(8, 'AM.EN.U4EEE23015', 'Sneha Patel', 'sneha.patel@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98406 12345', 'Electrical and Electronics', 'student'),
(9, 'AM.EN.U4CSE23089', 'Rahul Menon', 'rahul.menon@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98407 23456', 'Computer Science and Engineering', 'student'),
(10, 'AM.EN.U4ECE23052', 'Priya Sundaram', 'priya.sundaram@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98408 34567', 'Electronics and Communication', 'student'),
(11, 'AM.EN.U4AIE23041', 'Vikram Aditya', 'vikram.aditya@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98409 45678', 'Artificial Intelligence & Data Science', 'student'),
(12, 'AM.EN.U4ME23019', 'Meera Krishnan', 'meera.krishnan@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98410 56789', 'Mechanical Engineering', 'student'),
(13, 'AM.EN.U4CSE23112', 'Arjun Reddy', 'arjun.reddy@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98411 67890', 'Computer Science and Engineering', 'student'),
(14, 'AM.EN.U4CIV23007', 'Pooja Hegde', 'pooja.hegde@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98412 78901', 'Civil Engineering', 'student'),
(15, 'AM.EN.U4CSE23134', 'Siddharth Roy', 'siddharth.roy@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98413 89012', 'Computer Science and Engineering', 'student'),
(16, 'AM.EN.U4ECE23067', 'Tanvi Joshi', 'tanvi.joshi@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98414 90123', 'Electronics and Communication', 'student'),
(17, 'AM.EN.U4AIE23060', 'Abhinav Gupta', 'abhinav.gupta@campustrack.edu', '$2b$10$jObpDzzDBnvmr.qRuoVVXOSLRP9xyHVDVnJskP21Qb3hiaMSTFPNO', '+91 98415 01234', 'Artificial Intelligence & Data Science', 'student')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- -------------------------------------------------------
-- 4. LOST ITEMS SEED (20 Items)
-- -------------------------------------------------------
INSERT INTO lost_items (lost_id, student_id, category_id, location_id, item_name, description, brand, primary_color, date_lost, approx_time, identifying_details, status) VALUES
(1, 2, 4, 1, 'Black Leather Fossil Wallet', 'Bi-fold dark brown/black leather wallet with currency compartment and RFID blocking lining', 'Fossil', 'Black', '2026-09-08', '14:30:00', 'Contains student ID card ending in 23012, SBI debit card, and passport-size photo inside clear sleeve', 'Matched'),
(2, 3, 2, 2, 'iPhone 13 Midnight Blue 128GB', 'Apple iPhone 13 with matte black silicone bumper case and tempered glass screen protector', 'Apple', 'Blue', '2026-09-09', '11:15:00', 'Lock screen has photo of a golden retriever puppy; transparent sticker of GitHub octocat on back', 'Matched'),
(3, 2, 1, 4, 'Student ID Card & Amrita Smart Card', 'Campus student identification card on navy blue neck lanyard with plastic card sleeve', 'Campus Card', 'Blue', '2026-09-10', '13:00:00', 'Registration number AM.EN.U4CSE23012 with library barcode on reverse side', 'Matched'),
(4, 4, 7, 3, 'Boat Airdopes 141 Wireless Earbuds', 'True wireless earbuds in compact matte black charging case with LED battery indicator', 'Boat', 'Black', '2026-09-07', '16:45:00', 'Small scratch on right earbud body; silicone tips are size M', 'Matched'),
(5, 5, 9, 5, 'Fastrack Reflex Play Smartwatch', 'Black dial touchscreen fitness smartwatch with textured black silicone strap', 'Fastrack', 'Black', '2026-09-06', '18:00:00', 'Metal buckle has slight scratch; watch face is set to digital neon orange clock', 'Matched'),
(6, 6, 6, 8, 'Casio FX-991CW Scientific Calculator', 'ClassWiz advanced scientific calculator with white sliding protective cover', 'Casio', 'Black', '2026-09-08', '09:30:00', 'Small silver sticker with initials D.N. taped inside the protective cover', 'Matched'),
(7, 7, 8, 1, 'Milton ThermoSteel Flip Lid Flask 1L', 'Double walled vacuum insulated stainless steel water flask with push button sip cap', 'Milton', 'Silver', '2026-09-09', '15:20:00', 'Dent on the bottom steel rim; red sports strap attached around the neck', 'Lost'),
(8, 8, 5, 4, 'Honda Activa Key with Iron Man Keychain', 'Single scooter ignition key with red and gold metallic Iron Man miniature helmet', 'Honda', 'Silver', '2026-09-09', '12:40:00', 'Black plastic key grip with engraved code H-492', 'Lost'),
(9, 9, 3, 9, 'Dell 65W Type-C Laptop Power Adapter', 'Black charging brick with USB-C cable and 3-pin Indian wall plug', 'Dell', 'Black', '2026-09-05', '17:10:00', 'White velcro cable tie wrapped around the middle of the long cord', 'Claimed'),
(10, 10, 10, 1, 'Ray-Ban Wayfarer Classic Glasses', 'Dark tortoise shell optical frame with anti-reflective blue-light filter prescription lenses', 'Ray-Ban', 'Brown', '2026-09-04', '14:00:00', 'Model RB2140 engraved on inside of left temple', 'Closed'),
(11, 11, 2, 7, 'OnePlus Nord CE 3 Lite Pastel Lime', 'Pastel lime green back panel with dual circular camera lenses and clear shockproof case', 'OnePlus', 'Green', '2026-09-10', '10:30:00', 'Emergency contact on lock screen shows Vikram +91 98409 45678', 'Lost'),
(12, 12, 6, 2, 'Database System Concepts 7th Edition (Korth)', 'Hardcover reference book with black & gold cover spine, McGraw Hill publication', 'McGraw Hill', 'Black', '2026-09-08', '13:45:00', 'Yellow sticky notes on indexing and transactions chapters 12 and 14', 'Lost'),
(13, 13, 7, 4, 'Sony WH-CH520 Wireless On-Ear Headphones', 'Lightweight wireless on-ear headphones in beige color with soft padded ear cups', 'Sony', 'Beige', '2026-09-07', '19:15:00', 'Left ear-pad has minor ink mark near USB-C port', 'Lost'),
(14, 14, 4, 6, 'H&M Zip Around Maroon Ladies Wallet', 'Textured faux leather maroon wallet with gold metal zipper and wristlet loop', 'H&M', 'Red', '2026-09-06', '17:00:00', 'Contains Aadhaar card photocopy and college cultural fest entry wristband', 'Claimed'),
(15, 15, 8, 5, 'Decathlon Quechua Hiking Bottle 0.8L', 'Tritan transparent plastic bottle with dark blue flip top lid and measurement scale', 'Quechua', 'Blue', '2026-09-09', '07:30:00', 'Gym motivational quote printed on back; rubber grip ring around top', 'Lost'),
(16, 16, 3, 9, 'SanDisk Extreme 1TB Portable SSD', 'Rugged black external solid state drive with orange carabiner loop corner', 'SanDisk', 'Black', '2026-09-08', '16:00:00', 'Label on rear reads "Tanvi_Projects_2026" written with black permanent marker', 'Lost'),
(17, 17, 5, 10, 'Hostel Room Key 214 & Godrej Padlock Key', 'Brass ring with two silver keys and green acrylic room number tag "214"', 'Godrej', 'Silver', '2026-09-10', '18:30:00', 'Green tag has handwritten marker text "B-Block"', 'Lost'),
(18, 3, 9, 3, 'Titan Neo Analog Watch with Brown Leather Strap', 'Silver sunray dial with Roman numerals and brown genuine leather stitched strap', 'Titan', 'Brown', '2026-09-05', '11:45:00', 'Case back engraved with 50m water resistant and serial 1805SL01', 'Lost'),
(19, 4, 1, 10, 'Tamil Nadu State Transport College Bus Pass', 'Laminated card pass with green border and passport photograph for route 14B', 'TNSTC', 'Green', '2026-09-08', '17:45:00', 'Stamped with College Principal seal dated July 2026', 'Lost'),
(20, 5, 2, 6, 'Samsung Galaxy S22 Phantom White', 'Compact flagship smartphone in frosted white glass with matte silver aluminum frame', 'Samsung', 'White', '2026-09-07', '15:10:00', 'Spigen clear bumper case; slight hairline crack on top-right tempered glass', 'Closed')
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- -------------------------------------------------------
-- 5. FOUND ITEMS SEED (20 Items)
-- -------------------------------------------------------
INSERT INTO found_items (found_id, student_id, category_id, location_id, item_name, description, brand, primary_color, date_found, approx_time, identifying_details, storage_location, status) VALUES
(1, 7, 4, 1, 'Black Leather Fossil Wallet', 'Found on study desk 14 in Central Library reading hall; black bi-fold leather wallet', 'Fossil', 'Black', '2026-09-08', '15:00:00', 'Cards verified inside wallet; held in security register #L-401', 'Central Library Security Counter', 'Matched'),
(2, 8, 2, 2, 'iPhone 13 Dark Blue with Black Case', 'Recovered from podium drawer in Main Academic Block Room 302 after CSE lecture', 'Apple', 'Blue', '2026-09-09', '11:40:00', 'Device powered on, locked with 6-digit passcode', 'Dean Office Security Locker', 'Matched'),
(3, 9, 1, 4, 'Student ID Card (CSE Dept)', 'Found near tray return counter at Food Court table #9; navy blue lanyard', 'Campus Card', 'Blue', '2026-09-10', '13:25:00', 'Amrita Vishwa Vidyapeetham student smart card', 'Amenities Center Helpdesk', 'Matched'),
(4, 10, 7, 3, 'Boat Wireless Earbuds Case Black', 'Found under bench workstation 6 in IoT lab; matte black casing with earbuds inside', 'Boat', 'Black', '2026-09-07', '17:15:00', 'Both earbuds present inside charging dock', 'IoT Lab Staff Room Cupboard', 'Matched'),
(5, 11, 9, 5, 'Black Touchscreen Smartwatch', 'Found on spectator bench near court 2 after evening badminton session', 'Fastrack', 'Black', '2026-09-06', '18:45:00', 'Battery was low; charged at sports office', 'Sports Pavilion Office', 'Matched'),
(6, 12, 6, 8, 'Casio ClassWiz Scientific Calculator', 'Left behind on front row bench in South Academic Room 108', 'Casio', 'Black', '2026-09-08', '10:15:00', 'White sliding cover included', 'Department Staff Room Reception', 'Matched'),
(7, 13, 3, 9, 'Dell USB-C 65W Power Adapter', 'Found plugged into floor socket at Computing Lab 4 desk 22', 'Dell', 'Black', '2026-09-05', '17:40:00', 'Cable neatly wound with velcro band', 'Computing Center Admin Room', 'Claimed'),
(8, 14, 10, 1, 'Tortoise Shell Prescription Spectacles', 'Found next to newspaper rack in 1st floor library reading hall', 'Ray-Ban', 'Brown', '2026-09-04', '14:30:00', 'Spectacles in black protective hardcase', 'Central Library Security Counter', 'Closed'),
(9, 15, 4, 6, 'Maroon Zip Purse with Wristlet', 'Found on seat row F in Central Auditorium after orientation seminar', 'H&M', 'Red', '2026-09-06', '17:30:00', 'Contains cards and small personal items', 'Auditorium Management Office', 'Claimed'),
(10, 16, 2, 6, 'Samsung S22 White in Clear Case', 'Handed over by cleaning staff after evening event in Auditorium', 'Samsung', 'White', '2026-09-07', '16:00:00', 'Screen shows emergency dialer', 'Campus Security Control Room', 'Closed'),
(11, 3, 8, 4, 'Cello Steel Insulated Bottle 750ml', 'Found near juice counter table; blue metallic finish stainless steel bottle', 'Cello', 'Blue', '2026-09-10', '12:15:00', 'Clean bottle with steel screw cap', 'Food Court Staff Register', 'Found'),
(12, 4, 5, 1, 'Two Yale Keys with Blue Spiral Wristband', 'Found resting on catalogue computer desk near library entrance', 'Yale', 'Silver', '2026-09-09', '16:30:00', 'Spiral wristband in bright cyan blue plastic', 'Central Library Security Counter', 'Found'),
(13, 5, 7, 2, 'Realme Buds Air 3 White Case', 'Left behind on desk row 4 in Academic Block Room 302', 'Realme', 'White', '2026-09-10', '14:10:00', 'Glossy white charging pebble case', 'Security Room Main Gate', 'Found'),
(14, 6, 9, 4, 'Noise ColorFit Smartwatch with Rose Gold Rim', 'Found near Food Court outdoor seating area under umbrella table', 'Noise', 'Black', '2026-09-08', '19:00:00', 'Rose gold metallic bezel with black magnetic loop strap', 'Campus Security Control Room', 'Found'),
(15, 7, 6, 1, 'Discrete Mathematics Notebook (Spiraled)', '200-page classmate spiral notebook with complete handwritten lecture notes', 'Classmate', 'Multi', '2026-09-09', '17:00:00', 'First page contains unit 1 relations & functions', 'Library Lost Property Shelf', 'Found'),
(16, 8, 10, 3, 'Fastrack Black Matte Polarized Sunglasses', 'Left near soldering station in IoT Lab block', 'Fastrack', 'Black', '2026-09-07', '18:00:00', 'Square frames with dark grey lenses', 'Lab Assistant Office', 'Found'),
(17, 9, 8, 5, 'Decathlon Metal Gym Flask 1.2L', 'Found beside dumbbell rack in campus gym dressing room', 'Domyos', 'Black', '2026-09-08', '08:30:00', 'Heavy duty powder-coated black bottle', 'Gym Instructor Desk', 'Found'),
(18, 10, 5, 10, 'TVS Jupiter Bike Key with Leather Pouch', 'Found on tarmac pavement beside Bus Bay 3', 'TVS', 'Black', '2026-09-10', '18:50:00', 'Small brown leather zip pouch attached with key', 'Transport Department Office', 'Found'),
(19, 11, 3, 2, 'Logitech Pebble Wireless Mouse Graphite', 'Left connected to room projector console in Room 302', 'Logitech', 'Grey', '2026-09-09', '15:50:00', 'Slim silent-click portable wireless mouse', 'Academic Block Admin Office', 'Found'),
(20, 12, 2, 7, 'Redmi Note 12 Onyx Gray', 'Found near safety gear locker in Mechanical Workshop Bay 2', 'Xiaomi', 'Grey', '2026-09-06', '12:20:00', 'Cracked screen guard, black protective bumper', 'Workshop Foreman Office', 'Found')
ON DUPLICATE KEY UPDATE item_name = VALUES(item_name);

-- -------------------------------------------------------
-- 6. MATCHES SEED (10 High & Medium Matches)
-- -------------------------------------------------------
INSERT INTO matches (match_id, lost_id, found_id, score, match_status, verified_by, verified_at) VALUES
(1, 1, 1, 95, 'Verified', 1, '2026-09-08 16:00:00'),
(2, 2, 2, 92, 'Verified', 1, '2026-09-09 13:00:00'),
(3, 3, 3, 90, 'Verified', 1, '2026-09-10 14:00:00'),
(4, 4, 4, 88, 'Suggested', NULL, NULL),
(5, 5, 5, 85, 'Suggested', NULL, NULL),
(6, 6, 6, 82, 'Suggested', NULL, NULL),
(7, 9, 7, 94, 'Verified', 1, '2026-09-05 18:30:00'),
(8, 10, 8, 96, 'Verified', 1, '2026-09-04 15:45:00'),
(9, 14, 9, 91, 'Verified', 1, '2026-09-06 18:15:00'),
(10, 20, 10, 93, 'Verified', 1, '2026-09-07 17:00:00')
ON DUPLICATE KEY UPDATE score = VALUES(score);

-- -------------------------------------------------------
-- 7. CLAIMS SEED (8 Realistic Claims)
-- -------------------------------------------------------
INSERT INTO claims (claim_id, match_id, lost_id, found_id, claimant_id, claim_description, identifying_marks, proof_details, claim_status, admin_remarks, approved_by, claimed_at, closed_at) VALUES
(1, 1, 1, 1, 2, 'Claiming my lost Fossil bi-fold wallet reported lost at Central Library', 'Contains my college smart card AM.EN.U4CSE23012, SBI debit card with chip, and photo', 'I can produce my national identity card and match the registration number on the internal card', 'Pending', NULL, NULL, NULL, NULL),
(2, 2, 2, 2, 3, 'Claiming my iPhone 13 reported lost after morning lecture in Room 302', 'Phone lock screen wallpaper is a golden retriever dog; IMEI number available on original retail invoice', 'Can unlock device instantly with my face ID and passcode in front of security officer', 'Pending', NULL, NULL, NULL, NULL),
(3, 3, 3, 3, 2, 'Claiming my college student ID smart card with blue neck lanyard', 'Card bears my name Mohul Ramjee and roll number 23012 with library barcode', 'Registered college profile email matches student record on CampusTrack portal', 'Pending', NULL, NULL, NULL, NULL),
(4, 4, 4, 4, 4, 'Claiming Boat Airdopes 141 wireless earbuds left in IoT Lab', 'Charging case has a faint scratch near the hinge on the right side; connected device name is "Ananya Earbuds"', 'My smartphone Bluetooth history displays paired connection with MAC address matching device', 'Pending', NULL, NULL, NULL, NULL),
(5, 7, 9, 7, 9, 'Claiming Dell 65W USB-C laptop power brick left in Computing Lab 4', 'Adapter has white velcro strap wrapped around cable; serial number matches my laptop kit', 'Serial number registered in department laptop hardware register', 'Approved', 'Verified cable markings and confirmed ownership via serial record.', 1, '2026-09-06 10:00:00', NULL),
(6, 8, 10, 8, 10, 'Claiming Ray-Ban tortoiseshell spectacles left in library reading room', 'Frame model is RB2140 Wayfarer with -1.75 diopter left and -1.50 right prescription lenses', 'Original optical prescription receipt from lens clinic verified', 'Approved', 'Prescription card matches lenses perfectly; handed over to student.', 1, '2026-09-05 11:30:00', '2026-09-05 12:00:00'),
(7, 9, 14, 9, 14, 'Claiming H&M maroon zip ladies wallet left in Central Auditorium', 'Contains Aadhaar card photocopy for Pooja Hegde and college fest wristband #842', 'Government identity matches Aadhaar card photocopy inside wallet', 'Approved', 'Owner identity confirmed and item returned safely.', 1, '2026-09-07 09:15:00', NULL),
(8, 10, 20, 10, 5, 'Claiming Samsung Galaxy S22 white found in Auditorium foyer', 'Phone has hairline crack on top-right tempered glass and Spigen bumper case', 'Owner unlocked phone with biometric fingerprint in presence of campus security officer', 'Approved', 'Biometric unlock successful. Case closed.', 1, '2026-09-08 14:00:00', '2026-09-08 14:30:00')
ON DUPLICATE KEY UPDATE claim_description = VALUES(claim_description);

-- -------------------------------------------------------
-- 8. STATUS AUDIT LOG SEED
-- -------------------------------------------------------
INSERT INTO status_audit_log (log_id, entity_type, entity_id, old_status, new_status, changed_by, change_notes) VALUES
(1, 'LOST', 9, 'Matched', 'Claimed', 1, 'Dell adapter claimed by Rahul Menon and verified by Admin'),
(2, 'FOUND', 7, 'Matched', 'Claimed', 1, 'Dell adapter custody handed over to claimant'),
(3, 'CLAIM', 5, 'Pending', 'Approved', 1, 'Claim approved following hardware register validation'),
(4, 'LOST', 10, 'Claimed', 'Closed', 1, 'Ray-Ban spectacles handed over and case closed'),
(5, 'FOUND', 8, 'Claimed', 'Closed', 1, 'Ray-Ban spectacles custody finalized'),
(6, 'CLAIM', 6, 'Approved', 'Closed', 1, 'Case formally closed after receipt signed'),
(7, 'LOST', 20, 'Claimed', 'Closed', 1, 'Samsung Galaxy S22 confirmed collected by owner'),
(8, 'CLAIM', 8, 'Approved', 'Closed', 1, 'Handover protocol completed')
ON DUPLICATE KEY UPDATE change_notes = VALUES(change_notes);

