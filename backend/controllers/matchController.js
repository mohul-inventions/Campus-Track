const { query } = require('../config/db');

async function getAllMatches(req, res, next) {
  try {
    const { status, min_score, limit = 50 } = req.query;
    let sql = `
      SELECT 
        m.match_id,
        m.score,
        m.match_status,
        m.created_at,
        m.verified_at,
        -- Lost Item Info
        l.lost_id,
        l.item_name AS lost_name,
        l.brand AS lost_brand,
        l.primary_color AS lost_color,
        l.date_lost,
        l.status AS lost_status,
        s_lost.student_id AS lost_student_id,
        s_lost.full_name AS lost_by_name,
        -- Found Item Info
        f.found_id,
        f.item_name AS found_name,
        f.brand AS found_brand,
        f.primary_color AS found_color,
        f.date_found,
        f.storage_location,
        f.status AS found_status,
        s_found.student_id AS found_student_id,
        s_found.full_name AS found_by_name,
        -- Shared attributes
        c.category_name,
        c.icon AS category_icon,
        loc_lost.location_name AS lost_location_name,
        loc_found.location_name AS found_location_name
      FROM matches m
      JOIN lost_items l ON m.lost_id = l.lost_id
      JOIN found_items f ON m.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc_lost ON l.location_id = loc_lost.location_id
      JOIN locations loc_found ON f.location_id = loc_found.location_id
      JOIN students s_lost ON l.student_id = s_lost.student_id
      JOIN students s_found ON f.student_id = s_found.student_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND m.match_status = ?';
      params.push(status);
    }
    if (min_score) {
      sql += ' AND m.score >= ?';
      params.push(parseInt(min_score, 10));
    }

    sql += ' ORDER BY m.score DESC, m.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const matches = await query(sql, params);

    res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
}

async function getMyMatches(req, res, next) {
  try {
    const studentId = req.user.student_id;
    const matches = await query(
      `SELECT 
        m.match_id,
        m.score,
        m.match_status,
        m.created_at,
        l.lost_id,
        l.item_name AS lost_name,
        l.date_lost,
        l.status AS lost_status,
        l.student_id AS lost_student_id,
        f.found_id,
        f.item_name AS found_name,
        f.date_found,
        f.storage_location,
        f.status AS found_status,
        f.student_id AS found_student_id,
        c.category_name,
        c.icon AS category_icon,
        loc_lost.location_name AS lost_location_name,
        loc_found.location_name AS found_location_name,
        (SELECT claim_status FROM claims cl WHERE cl.match_id = m.match_id AND cl.claimant_id = ? LIMIT 1) AS user_claim_status
      FROM matches m
      JOIN lost_items l ON m.lost_id = l.lost_id
      JOIN found_items f ON m.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc_lost ON l.location_id = loc_lost.location_id
      JOIN locations loc_found ON f.location_id = loc_found.location_id
      WHERE l.student_id = ? OR f.student_id = ?
      ORDER BY m.score DESC, m.created_at DESC`,
      [studentId, studentId, studentId]
    );

    res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
}

async function getMatchById(req, res, next) {
  try {
    const { id } = req.params;
    const matches = await query(
      `SELECT 
        m.*,
        l.item_name AS lost_name, l.description AS lost_desc, l.brand AS lost_brand, l.primary_color AS lost_color, l.date_lost, l.identifying_details AS lost_id_details, l.status AS lost_status,
        f.item_name AS found_name, f.description AS found_desc, f.brand AS found_brand, f.primary_color AS found_color, f.date_found, f.storage_location, f.status AS found_status,
        c.category_name, c.icon,
        loc_lost.location_name AS lost_location, loc_found.location_name AS found_location,
        s_lost.full_name AS lost_by_name, s_found.full_name AS found_by_name
      FROM matches m
      JOIN lost_items l ON m.lost_id = l.lost_id
      JOIN found_items f ON m.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc_lost ON l.location_id = loc_lost.location_id
      JOIN locations loc_found ON f.location_id = loc_found.location_id
      JOIN students s_lost ON l.student_id = s_lost.student_id
      JOIN students s_found ON f.student_id = s_found.student_id
      WHERE m.match_id = ?`,
      [id]
    );

    if (matches.length === 0) {
      return res.status(404).json({ success: false, message: 'Match record not found.' });
    }

    res.json({ success: true, match: matches[0] });
  } catch (err) {
    next(err);
  }
}

async function verifyMatch(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Verified' or 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid match status. Must be Verified or Rejected.' });
    }

    await query(
      'UPDATE matches SET match_status = ?, verified_by = ?, verified_at = NOW() WHERE match_id = ?',
      [status, req.user.student_id, id]
    );

    res.json({ success: true, message: `Match #${id} updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllMatches,
  getMyMatches,
  getMatchById,
  verifyMatch
};
