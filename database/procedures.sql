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
