const express = require('express');
const router = express.Router();
const { createFoundItem, getAllFoundItems, getFoundItemById, getMyFoundItems } = require('../controllers/foundController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAllFoundItems);
router.get('/my', verifyToken, getMyFoundItems);
router.get('/:id', optionalAuth, getFoundItemById);
router.post('/', verifyToken, createFoundItem);

module.exports = router;
