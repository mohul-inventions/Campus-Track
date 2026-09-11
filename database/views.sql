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
