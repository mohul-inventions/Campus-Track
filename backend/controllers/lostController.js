const { query } = require('../config/db');
const { findMatchesForLostItem } = require('../services/matchingService');

async function createLostItem(req, res, next) {
  try {
    const {
      category_id,
      location_id,
      item_name,
      description,
      brand,
      primary_color,
      date_lost,
      approx_time,
      identifying_details
    } = req.body;

    if (!category_id || !location_id || !item_name || !description || !primary_color || !date_lost) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: category, location, item name, description, color, and date lost are required.'
      });
    }

    const student_id = req.user.student_id;

    const result = await query(
      `INSERT INTO lost_items 
       (student_id, category_id, location_id, item_name, description, brand, primary_color, date_lost, approx_time, identifying_details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Lost')`,
      [
        student_id,
        category_id,
        location_id,
        item_name.trim(),
        description.trim(),
        brand ? brand.trim() : null,
        primary_color.trim(),
        date_lost,
        approx_time || null,
        identifying_details ? identifying_details.trim() : null
      ]
    );

    const lostId = result.insertId;

    // Run matching engine asynchronously
    const matchesFound = await findMatchesForLostItem(lostId);

    // Retrieve inserted record with joins
    const [inserted] = await query(
      `SELECT l.*, c.category_name, loc.location_name, loc.building, s.full_name AS student_name
       FROM lost_items l
       JOIN categories c ON l.category_id = c.category_id
       JOIN locations loc ON l.location_id = loc.location_id
       JOIN students s ON l.student_id = s.student_id
       WHERE l.lost_id = ?`,
      [lostId]
    );

    res.status(201).json({
      success: true,
      message: `Lost item report #L-${lostId} filed successfully.`,
      lostItem: inserted,
      potentialMatchesCount: matchesFound.length
    });
  } catch (err) {
    next(err);
  }
}

async function getAllLostItems(req, res, next) {
  try {
    const { category_id, location_id, status, search, limit = 50, page = 1 } = req.query;
    let sql = `
      SELECT 
        l.lost_id,
        l.item_name,
        l.description,
        l.brand,
        l.primary_color,
        l.date_lost,
        l.approx_time,
        l.status,
        l.created_at,
        c.category_id,
        c.category_name,
        c.icon,
        loc.location_id,
        loc.location_name,
        loc.building,
        s.full_name AS reported_by,
        s.department
      FROM lost_items l
      JOIN categories c ON l.category_id = c.category_id
      JOIN locations loc ON l.location_id = loc.location_id
      JOIN students s ON l.student_id = s.student_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND l.category_id = ?';
      params.push(category_id);
    }
    if (location_id) {
      sql += ' AND l.location_id = ?';
      params.push(location_id);
    }
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (l.item_name LIKE ? OR l.description LIKE ? OR l.brand LIKE ? OR l.primary_color LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const items = await query(sql, params);

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
}

async function getLostItemById(req, res, next) {
  try {
    const { id } = req.params;
    const items = await query(
      `SELECT l.*, c.category_name, c.icon, loc.location_name, loc.building, loc.floor_zone, s.full_name AS student_name, s.department
       FROM lost_items l
       JOIN categories c ON l.category_id = c.category_id
       JOIN locations loc ON l.location_id = loc.location_id
       JOIN students s ON l.student_id = s.student_id
       WHERE l.lost_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Lost item record not found.' });
    }

    res.json({ success: true, item: items[0] });
  } catch (err) {
    next(err);
  }
}

async function getMyLostItems(req, res, next) {
  try {
    const items = await query(
      `SELECT l.*, c.category_name, c.icon, loc.location_name, loc.building,
              (SELECT COUNT(*) FROM matches m WHERE m.lost_id = l.lost_id) AS match_count
       FROM lost_items l
       JOIN categories c ON l.category_id = c.category_id
       JOIN locations loc ON l.location_id = loc.location_id
       WHERE l.student_id = ?
       ORDER BY l.created_at DESC`,
      [req.user.student_id]
    );

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLostItem,
  getAllLostItems,
  getLostItemById,
  getMyLostItems
};
