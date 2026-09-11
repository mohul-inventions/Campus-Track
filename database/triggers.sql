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
