const { query } = require('../config/db');
const { findMatchesForFoundItem } = require('../services/matchingService');

async function createFoundItem(req, res, next) {
  try {
    const {
      category_id,
      location_id,
      item_name,
      description,
      brand,
      primary_color,
      date_found,
      approx_time,
      identifying_details,
      storage_location
    } = req.body;

    if (!category_id || !location_id || !item_name || !description || !primary_color || !date_found) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: category, location, item name, description, color, and date found are required.'
      });
    }

    const student_id = req.user.student_id;

    const result = await query(
      `INSERT INTO found_items 
       (student_id, category_id, location_id, item_name, description, brand, primary_color, date_found, approx_time, identifying_details, storage_location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Found')`,
      [
        student_id,
        category_id,
        location_id,
        item_name.trim(),
        description.trim(),
        brand ? brand.trim() : null,
        primary_color.trim(),
        date_found,
        approx_time || null,
        identifying_details ? identifying_details.trim() : null,
        storage_location ? storage_location.trim() : 'Campus Security Desk / Lost & Found Center'
      ]
    );

    const foundId = result.insertId;

    // Run matching engine asynchronously
    const matchesFound = await findMatchesForFoundItem(foundId);

    const [inserted] = await query(
      `SELECT f.*, c.category_name, loc.location_name, loc.building, s.full_name AS reported_by
       FROM found_items f
       JOIN categories c ON f.category_id = c.category_id
       JOIN locations loc ON f.location_id = loc.location_id
       JOIN students s ON f.student_id = s.student_id
       WHERE f.found_id = ?`,
      [foundId]
    );

    res.status(201).json({
      success: true,
      message: `Found item report #F-${foundId} registered successfully. Thank you for your honesty!`,
      foundItem: inserted,
      potentialMatchesCount: matchesFound.length
    });
  } catch (err) {
    next(err);
  }
}

async function getAllFoundItems(req, res, next) {
  try {
    const { category_id, location_id, status, search, limit = 50, page = 1 } = req.query;
    let sql = `
      SELECT 
        f.found_id,
        f.item_name,
        f.description,
        f.brand,
        f.primary_color,
        f.date_found,
        f.approx_time,
        f.storage_location,
        f.status,
        f.created_at,
        c.category_id,
        c.category_name,
        c.icon,
        loc.location_id,
        loc.location_name,
        loc.building,
        s.full_name AS reported_by,
        s.department
      FROM found_items f
      JOIN categories c ON f.category_id = c.category_id
      JOIN locations loc ON f.location_id = loc.location_id
      JOIN students s ON f.student_id = s.student_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND f.category_id = ?';
      params.push(category_id);
    }
    if (location_id) {
      sql += ' AND f.location_id = ?';
      params.push(location_id);
    }
    if (status) {
      sql += ' AND f.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (f.item_name LIKE ? OR f.description LIKE ? OR f.brand LIKE ? OR f.primary_color LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
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

async function getFoundItemById(req, res, next) {
  try {
    const { id } = req.params;
    const items = await query(
      `SELECT f.*, c.category_name, c.icon, loc.location_name, loc.building, loc.floor_zone, s.full_name AS reported_by, s.department
       FROM found_items f
       JOIN categories c ON f.category_id = c.category_id
       JOIN locations loc ON f.location_id = loc.location_id
       JOIN students s ON f.student_id = s.student_id
       WHERE f.found_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Found item record not found.' });
    }

    res.json({ success: true, item: items[0] });
  } catch (err) {
    next(err);
  }
}

async function getMyFoundItems(req, res, next) {
  try {
    const items = await query(
      `SELECT f.*, c.category_name, c.icon, loc.location_name, loc.building
       FROM found_items f
       JOIN categories c ON f.category_id = c.category_id
       JOIN locations loc ON f.location_id = loc.location_id
       WHERE f.student_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.student_id]
    );

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFoundItem,
  getAllFoundItems,
  getFoundItemById,
  getMyFoundItems
};
