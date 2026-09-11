const { query } = require('../config/db');

async function createClaim(req, res, next) {
  try {
    const { match_id, lost_id, found_id, claim_description, identifying_marks, proof_details } = req.body;

    if (!lost_id || !found_id || !claim_description || !identifying_marks) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: lost_id, found_id, claim description, and unique identifying marks are required.'
      });
    }

    const claimant_id = req.user.student_id;

    // Check if claimant has already submitted a pending claim on this item
    const existing = await query(
      'SELECT claim_id, claim_status FROM claims WHERE found_id = ? AND claimant_id = ? AND claim_status = "Pending"',
      [found_id, claimant_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active pending claim for this item awaiting admin review.'
      });
    }

    const result = await query(
      `INSERT INTO claims 
       (match_id, lost_id, found_id, claimant_id, claim_description, identifying_marks, proof_details, claim_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        match_id || null,
        lost_id,
        found_id,
        claimant_id,
        claim_description.trim(),
        identifying_marks.trim(),
        proof_details ? proof_details.trim() : null
      ]
    );

    const claimId = result.insertId;

    res.status(201).json({
      success: true,
      message: `Claim #CLM-${claimId} submitted successfully. Campus administration has been notified for verification.`,
      claim_id: claimId
    });
  } catch (err) {
    next(err);
  }
}

async function getMyClaims(req, res, next) {
  try {
    const claimant_id = req.user.student_id;
    const claims = await query(
      `SELECT 
        cl.*,
        l.item_name AS lost_item_name,
        l.brand,
        l.primary_color,
        f.item_name AS found_item_name,
        f.storage_location,
        c.category_name,
        c.icon,
        loc.location_name
      FROM claims cl
      JOIN lost_items l ON cl.lost_id = l.lost_id
      JOIN found_items f ON cl.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc ON f.location_id = loc.location_id
      WHERE cl.claimant_id = ?
      ORDER BY cl.created_at DESC`,
      [claimant_id]
    );

    res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    next(err);
  }
}

async function getClaimById(req, res, next) {
  try {
    const { id } = req.params;
    const claims = await query(
      `SELECT 
        cl.*,
        s.full_name AS claimant_name,
        s.email AS claimant_email,
        s.phone AS claimant_phone,
        s.department AS claimant_department,
        l.item_name AS lost_name,
        f.item_name AS found_name,
        f.storage_location,
        c.category_name,
        loc.location_name
      FROM claims cl
      JOIN students s ON cl.claimant_id = s.student_id
      JOIN lost_items l ON cl.lost_id = l.lost_id
      JOIN found_items f ON cl.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc ON f.location_id = loc.location_id
      WHERE cl.claim_id = ?`,
      [id]
    );

    if (claims.length === 0) {
      return res.status(404).json({ success: false, message: 'Claim record not found.' });
    }

    res.json({ success: true, claim: claims[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createClaim,
  getMyClaims,
  getClaimById
};
