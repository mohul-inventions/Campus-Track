const express = require('express');
const router = express.Router();
const { createClaim, getMyClaims, getClaimById } = require('../controllers/claimController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createClaim);
router.get('/my', verifyToken, getMyClaims);
router.get('/:id', verifyToken, getClaimById);

module.exports = router;
