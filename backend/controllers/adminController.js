const { query } = require('../config/db');
const { approveClaimTransaction, closeCaseTransaction } = require('../services/transactionService');

async function getDashboardStats(req, res, next) {
  try {
    // 1. KPI Counts
    const [studentsCount] = await query('SELECT COUNT(*) AS total FROM students WHERE role = "student"');
    const [lostCount] = await query('SELECT COUNT(*) AS total FROM lost_items');
    const [foundCount] = await query('SELECT COUNT(*) AS total FROM found_items');
    const [pendingMatchesCount] = await query('SELECT COUNT(*) AS total FROM matches WHERE match_status = "Suggested"');
    const [pendingClaimsCount] = await query('SELECT COUNT(*) AS total FROM claims WHERE claim_status = "Pending"');
    const [returnedItemsCount] = await query('SELECT COUNT(*) AS total FROM claims WHERE claim_status = "Approved"');

    // 2. Lost Items by Category (DBMS GROUP BY query)
    const categoryDistribution = await query(`
      SELECT c.category_name, COUNT(l.lost_id) AS lost_count, COUNT(f.found_id) AS found_count
      FROM categories c
      LEFT JOIN lost_items l ON c.category_id = l.category_id
      LEFT JOIN found_items f ON c.category_id = f.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY (COUNT(l.lost_id) + COUNT(f.found_id)) DESC
      LIMIT 8
    `);

    // 3. Reports by Campus Location (DBMS GROUP BY & HAVING)
    const locationDistribution = await query(`
      SELECT loc.location_name, loc.building, COUNT(l.lost_id) AS lost_count, COUNT(f.found_id) AS found_count
      FROM locations loc
      LEFT JOIN lost_items l ON loc.location_id = l.location_id
      LEFT JOIN found_items f ON loc.location_id = f.location_id
      GROUP BY loc.location_id, loc.location_name, loc.building
      HAVING (COUNT(l.lost_id) + COUNT(f.found_id)) > 0
      ORDER BY (COUNT(l.lost_id) + COUNT(f.found_id)) DESC
      LIMIT 6
    `);

    // 4. Status Breakdown
    const statusDistribution = await query(`
      SELECT 
        status, 
        COUNT(*) AS count 
      FROM (
        SELECT status FROM lost_items
        UNION ALL
        SELECT status FROM found_items
      ) AS combined_items
      GROUP BY status
    `);

    // 5. Recent Activity Feed
    const recentActivity = await query(`
      SELECT 'LOST' AS type, l.lost_id AS id, l.item_name AS title, l.status, s.full_name AS person, l.created_at
      FROM lost_items l JOIN students s ON l.student_id = s.student_id
      UNION ALL
      SELECT 'FOUND' AS type, f.found_id AS id, f.item_name AS title, f.status, s.full_name AS person, f.created_at
      FROM found_items f JOIN students s ON f.student_id = s.student_id
      UNION ALL
      SELECT 'CLAIM' AS type, cl.claim_id AS id, CONCAT('Claim on: ', l.item_name) AS title, cl.claim_status AS status, s.full_name AS person, cl.created_at
      FROM claims cl JOIN students s ON cl.claimant_id = s.student_id JOIN lost_items l ON cl.lost_id = l.lost_id
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      kpis: {
        totalStudents: studentsCount.total,
        totalLost: lostCount.total,
        totalFound: foundCount.total,
        pendingMatches: pendingMatchesCount.total,
        pendingClaims: pendingClaimsCount.total,
        returnedItems: returnedItemsCount.total,
        resolutionRate: Math.round(((returnedItemsCount.total * 2) / ((lostCount.total + foundCount.total) || 1)) * 100)
      },
      charts: {
        categoryDistribution,
        locationDistribution,
        statusDistribution
      },
      recentActivity
    });
  } catch (err) {
    next(err);
  }
}

async function getCategoryAnalytics(req, res, next) {
  try {
    const [stats] = await query('CALL GetCategoryStatistics()');
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

async function getLocationAnalytics(req, res, next) {
  try {
    const [stats] = await query('CALL GetLocationStatistics()');
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

async function getStudents(req, res, next) {
  try {
    const { search, department } = req.query;
    let sql = `
      SELECT 
        s.student_id, s.reg_no, s.full_name, s.email, s.phone, s.department, s.role, s.created_at,
        (SELECT COUNT(*) FROM lost_items l WHERE l.student_id = s.student_id) AS lost_count,
        (SELECT COUNT(*) FROM found_items f WHERE f.student_id = s.student_id) AS found_count,
        (SELECT COUNT(*) FROM claims c WHERE c.claimant_id = s.student_id) AS claims_count
      FROM students s
      WHERE s.role = 'student'
    `;
    const params = [];

    if (search) {
      sql += ' AND (s.full_name LIKE ? OR s.reg_no LIKE ? OR s.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (department) {
      sql += ' AND s.department = ?';
      params.push(department);
    }

    sql += ' ORDER BY s.created_at DESC';

    const students = await query(sql, params);
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    next(err);
  }
}

async function getAllClaims(req, res, next) {
  try {
    const { status } = req.query;
    let sql = `
      SELECT 
        cl.*,
        s.full_name AS claimant_name,
        s.reg_no AS claimant_reg_no,
        s.email AS claimant_email,
        s.phone AS claimant_phone,
        s.department AS claimant_department,
        l.item_name AS lost_name,
        l.brand AS lost_brand,
        l.primary_color AS lost_color,
        f.item_name AS found_name,
        f.brand AS found_brand,
        f.primary_color AS found_color,
        f.storage_location,
        c.category_name,
        c.icon AS category_icon,
        loc.location_name
      FROM claims cl
      JOIN students s ON cl.claimant_id = s.student_id
      JOIN lost_items l ON cl.lost_id = l.lost_id
      JOIN found_items f ON cl.found_id = f.found_id
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc ON f.location_id = loc.location_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND cl.claim_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY cl.created_at DESC';
    const claims = await query(sql, params);

    res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    next(err);
  }
}

async function reviewClaim(req, res, next) {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // 'Approve' or 'Reject'
    const adminId = req.user.student_id;

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be Approve or Reject.' });
    }

    if (action === 'Approve') {
      const result = await approveClaimTransaction(id, adminId, remarks);
      return res.json({ success: true, message: result.message });
    } else {
      await query(
        `UPDATE claims 
         SET claim_status = 'Rejected', admin_remarks = ? 
         WHERE claim_id = ?`,
        [remarks || 'Verification details did not match found item characteristics.', id]
      );

      await query(
        `INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by, change_notes)
         VALUES ('CLAIM', ?, 'Pending', 'Rejected', ?, ?)`,
        [id, adminId, remarks || 'Rejected by admin']
      );

      return res.json({ success: true, message: 'Claim has been rejected.' });
    }
  } catch (err) {
    next(err);
  }
}

async function closeCase(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.student_id;

    const result = await closeCaseTransaction(id, adminId, notes);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

async function updateItemStatus(req, res, next) {
  try {
    const { type, id } = req.params; // type: 'lost' or 'found'
    const { status, notes } = req.body;
    const adminId = req.user.student_id;

    if (!['Lost', 'Found', 'Matched', 'Claimed', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (type === 'lost') {
      await query('UPDATE lost_items SET status = ? WHERE lost_id = ?', [status, id]);
    } else if (type === 'found') {
      await query('UPDATE found_items SET status = ? WHERE found_id = ?', [status, id]);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid entity type. Must be lost or found.' });
    }

    res.json({ success: true, message: `${type.toUpperCase()} #${id} status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const logs = await query(`
      SELECT 
        a.*,
        s.full_name AS changer_name,
        s.role AS changer_role
      FROM status_audit_log a
      LEFT JOIN students s ON a.changed_by = s.student_id
      ORDER BY a.changed_at DESC
      LIMIT 100
    `);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getCategoryAnalytics,
  getLocationAnalytics,
  getStudents,
  getAllClaims,
  reviewClaim,
  closeCase,
  updateItemStatus,
  getAuditLogs
};
