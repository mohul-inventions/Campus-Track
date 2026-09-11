const express = require('express');
const router = express.Router();
const { getAllMatches, getMyMatches, getMatchById, verifyMatch } = require('../controllers/matchController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllMatches);
router.get('/my', verifyToken, getMyMatches);
router.get('/:id', verifyToken, getMatchById);
router.put('/:id/verify', verifyToken, requireAdmin, verifyMatch);

module.exports = router;
