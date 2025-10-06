const express = require('express');
const searchController = require('../controllers/searchController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

const router = express.Router();

// Apply API key authentication to all search routes
router.use(apiKeyAuth);

// Search routes
router.get('/properties', searchController.searchProperties);

module.exports = router;
