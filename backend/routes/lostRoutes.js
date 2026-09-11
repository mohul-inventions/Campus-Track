const express = require('express');
const router = express.Router();
const { createLostItem, getAllLostItems, getLostItemById, getMyLostItems } = require('../controllers/lostController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAllLostItems);
router.get('/my', verifyToken, getMyLostItems);
router.get('/:id', optionalAuth, getLostItemById);
router.post('/', verifyToken, createLostItem);

module.exports = router;
