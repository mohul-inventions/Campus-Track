const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campustrack_jwt_secret_super_secure_key_2026_capstone_amrita');

    const students = await query(
      'SELECT student_id, reg_no, full_name, email, phone, department, role FROM students WHERE student_id = ?',
      [decoded.student_id]
    );

    if (students.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found or account deactivated.' });
    }

    req.user = students[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.', error: err.message });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrative privileges required.' });
  }
  next();
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campustrack_jwt_secret_super_secure_key_2026_capstone_amrita');
      const students = await query(
        'SELECT student_id, reg_no, full_name, email, phone, department, role FROM students WHERE student_id = ?',
        [decoded.student_id]
      );
      if (students.length > 0) {
        req.user = students[0];
      }
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth
};
