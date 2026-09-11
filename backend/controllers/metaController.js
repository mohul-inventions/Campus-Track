const { query } = require('../config/db');

async function getCategories(req, res, next) {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY category_name ASC');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

async function getLocations(req, res, next) {
  try {
    const locations = await query('SELECT * FROM locations ORDER BY location_name ASC');
    res.json({ success: true, locations });
  } catch (err) {
    next(err);
  }
}

async function getPublicStats(req, res, next) {
  try {
    const [lostCount] = await query('SELECT COUNT(*) AS count FROM lost_items');
    const [foundCount] = await query('SELECT COUNT(*) AS count FROM found_items');
    const [resolvedCount] = await query('SELECT COUNT(*) AS count FROM claims WHERE claim_status = "Approved"');
    const [activeUsers] = await query('SELECT COUNT(*) AS count FROM students');

    res.json({
      success: true,
      stats: {
        totalLost: lostCount.count,
        totalFound: foundCount.count,
        totalResolved: resolvedCount.count,
        activeUsers: activeUsers.count,
        recoveryRate: Math.round(((resolvedCount.count * 2) / ((lostCount.count + foundCount.count) || 1)) * 100)
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getLocations,
  getPublicStats
};
