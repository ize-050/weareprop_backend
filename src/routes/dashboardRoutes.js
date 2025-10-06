const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Dashboard stats route (requires authentication) - Admin sees all data
router.get('/stats', authMiddleware.authenticate, dashboardController.getDashboardStats);

// Dashboard stats route for specific user (requires authentication) - User sees only own data
router.get('/stats/user/:userId', authMiddleware.authenticate, dashboardController.getUserDashboardStats);

module.exports = router;
