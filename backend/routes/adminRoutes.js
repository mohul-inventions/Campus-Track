const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCategoryAnalytics,
  getLocationAnalytics,
  getStudents,
  getAllClaims,
  reviewClaim,
  closeCase,
  updateItemStatus,
  getAuditLogs
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require admin privileges
router.use(verifyToken, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/analytics/locations', getLocationAnalytics);
router.get('/students', getStudents);
router.get('/claims', getAllClaims);
router.put('/claims/:id/review', reviewClaim);
router.put('/claims/:id/close', closeCase);
router.put('/items/:type/:id/status', updateItemStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
