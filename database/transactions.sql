-- =======================================================
-- CAMPUSTRACK: ACID Transactions Demonstration for Viva
-- =======================================================

USE campustrack_db;

-- -------------------------------------------------------
-- DEMO TRANSACTION 1: Successful Claim Approval & Return
-- Demonstrates Atomicity, Consistency, Isolation, and Durability.
-- All 4 entity states (Claim, Lost, Found, Match) must transition together.
-- -------------------------------------------------------

START TRANSACTION;

-- Step 1: Select and Lock the Claim record to prevent race conditions
SELECT claim_id, lost_id, found_id, match_id, claim_status 
FROM claims 
WHERE claim_id = 1 
FOR UPDATE;

-- Step 2: Approve the Claim
UPDATE claims 
SET 
    claim_status = 'Approved',
    admin_remarks = 'Physical identification card and serial number verified.',
    approved_by = 1, -- Admin User ID
    claimed_at = NOW()
WHERE claim_id = 1;

-- Step 3: Synchronize Lost Item Status
UPDATE lost_items 
SET status = 'Claimed' 
WHERE lost_id = (SELECT lost_id FROM claims WHERE claim_id = 1);

-- Step 4: Synchronize Found Item Status
UPDATE found_items 
SET status = 'Claimed' 
WHERE found_id = (SELECT found_id FROM claims WHERE claim_id = 1);

-- Step 5: Mark the Match as Verified
UPDATE matches 
SET 
    match_status = 'Verified',
    verified_by = 1,
    verified_at = NOW()
WHERE match_id = (SELECT match_id FROM claims WHERE claim_id = 1);

-- Step 6: Commit transaction to permanently persist state
COMMIT;

-- Verification query:
-- SELECT * FROM status_audit_log ORDER BY log_id DESC LIMIT 5;


-- -------------------------------------------------------
-- DEMO TRANSACTION 2: Case Closure (Archiving Handed-Over Items)
-- Transitions item from Claimed to Closed after final student receipt.
-- -------------------------------------------------------

START TRANSACTION;

UPDATE claims 
SET closed_at = NOW() 
WHERE claim_id = 1;

UPDATE lost_items 
SET status = 'Closed' 
WHERE lost_id = (SELECT lost_id FROM claims WHERE claim_id = 1);

UPDATE found_items 
SET status = 'Closed' 
WHERE found_id = (SELECT found_id FROM claims WHERE claim_id = 1);

COMMIT;


-- -------------------------------------------------------
-- DEMO TRANSACTION 3: Rollback on Verification Failure
-- Demonstrates how rollback protects data integrity if an error occurs.
-- -------------------------------------------------------

START TRANSACTION;

UPDATE claims 
SET claim_status = 'Rejected', admin_remarks = 'Identifying marks do not match item physical inspect.'
WHERE claim_id = 99999; -- Non-existent or conflicting ID simulation

-- Simulate detection of error condition
-- If something went wrong, ROLLBACK completely restores previous state:
ROLLBACK;
