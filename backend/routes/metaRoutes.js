const express = require('express');
const router = express.Router();
const { getCategories, getLocations, getPublicStats } = require('../controllers/metaController');

router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/public-stats', getPublicStats);

module.exports = router;
