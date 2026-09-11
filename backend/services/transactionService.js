/**
 * CampusTrack ACID Transaction Service
 * Demonstrates Atomicity, Consistency, Isolation, and Durability in MySQL.
 */
const { pool } = require('../config/db');

async function approveClaimTransaction(claimId, adminId, remarks) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lock and retrieve the claim record
    const [claims] = await connection.query(
      'SELECT claim_id, lost_id, found_id, match_id, claim_status FROM claims WHERE claim_id = ? FOR UPDATE',
      [claimId]
    );

    if (claims.length === 0) {
      throw new Error(`Claim with ID ${claimId} not found.`);
    }

    const claim = claims[0];
    if (claim.claim_status === 'Approved') {
      throw new Error('This claim has already been approved.');
    }

    // 2. Approve the claim
    await connection.query(
      `UPDATE claims 
       SET claim_status = 'Approved', 
           admin_remarks = ?, 
           approved_by = ?, 
           claimed_at = NOW() 
       WHERE claim_id = ?`,
      [remarks || 'Verified and approved by administrator.', adminId, claimId]
    );

    // 3. Update lost item status to Claimed
    await connection.query(
      'UPDATE lost_items SET status = "Claimed" WHERE lost_id = ?',
      [claim.lost_id]
    );

    // 4. Update found item status to Claimed
    await connection.query(
      'UPDATE found_items SET status = "Claimed" WHERE found_id = ?',
      [claim.found_id]
    );

    // 5. Update match status to Verified if linked
    if (claim.match_id) {
      await connection.query(
        'UPDATE matches SET match_status = "Verified", verified_by = ?, verified_at = NOW() WHERE match_id = ?',
        [adminId, claim.match_id]
      );
    }

    // 6. Reject any competing pending claims on the same found item
    await connection.query(
      `UPDATE claims 
       SET claim_status = 'Rejected', 
           admin_remarks = 'Another claimant successfully completed verification for this item.' 
       WHERE found_id = ? AND claim_id != ? AND claim_status = 'Pending'`,
      [claim.found_id, claimId]
    );

    // 7. Insert audit record
    await connection.query(
      `INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by, change_notes)
       VALUES ('CLAIM', ?, ?, 'Approved', ?, ?)`,
      [claimId, claim.claim_status, adminId, remarks || 'Approved by admin']
    );

    // Commit transaction
    await connection.commit();
    return { success: true, message: 'Claim approved successfully and related records synchronized.' };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function closeCaseTransaction(claimId, adminId, notes) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [claims] = await connection.query(
      'SELECT claim_id, lost_id, found_id, claim_status FROM claims WHERE claim_id = ? FOR UPDATE',
      [claimId]
    );

    if (claims.length === 0) {
      throw new Error(`Claim with ID ${claimId} not found.`);
    }

    const claim = claims[0];

    // 1. Mark claim as closed with timestamp
    await connection.query(
      'UPDATE claims SET closed_at = NOW(), admin_remarks = CONCAT(COALESCE(admin_remarks, ""), " | Case Closed: ", ?) WHERE claim_id = ?',
      [notes || 'Item handed over to student.', claimId]
    );

    // 2. Mark lost item as Closed
    await connection.query('UPDATE lost_items SET status = "Closed" WHERE lost_id = ?', [claim.lost_id]);

    // 3. Mark found item as Closed
    await connection.query('UPDATE found_items SET status = "Closed" WHERE found_id = ?', [claim.found_id]);

    // 4. Audit entry
    await connection.query(
      `INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by, change_notes)
       VALUES ('CLAIM', ?, 'Approved', 'Closed', ?, ?)`,
      [claimId, adminId, notes || 'Case closed after physical handover']
    );

    await connection.commit();
    return { success: true, message: 'Case formally closed and archived.' };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  approveClaimTransaction,
  closeCaseTransaction
};
