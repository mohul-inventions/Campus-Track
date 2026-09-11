const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

async function register(req, res, next) {
  try {
    const { reg_no, full_name, email, password, phone, department } = req.body;

    if (!reg_no || !full_name || !email || !password || !phone || !department) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check duplicate
    const existing = await query('SELECT student_id FROM students WHERE email = ? OR reg_no = ?', [email, reg_no]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email or register number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO students (reg_no, full_name, email, password_hash, phone, department, role)
       VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [reg_no.trim().toUpperCase(), full_name.trim(), email.trim().toLowerCase(), password_hash, phone.trim(), department.trim()]
    );

    const studentId = result.insertId;
    const token = jwt.sign(
      { student_id: studentId, role: 'student' },
      process.env.JWT_SECRET || 'campustrack_jwt_secret_super_secure_key_2026_capstone_amrita',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        student_id: studentId,
        reg_no: reg_no.trim().toUpperCase(),
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        role: 'student'
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM students WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email address or credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    const token = jwt.sign(
      { student_id: user.student_id, role: user.role },
      process.env.JWT_SECRET || 'campustrack_jwt_secret_super_secure_key_2026_capstone_amrita',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        student_id: user.student_id,
        reg_no: user.reg_no,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, department } = req.body;
    await query(
      'UPDATE students SET full_name = ?, phone = ?, department = ? WHERE student_id = ?',
      [full_name, phone, department, req.user.student_id]
    );

    const updated = await query(
      'SELECT student_id, reg_no, full_name, email, phone, department, role FROM students WHERE student_id = ?',
      [req.user.student_id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
