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
