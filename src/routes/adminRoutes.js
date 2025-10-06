const express = require('express');
const adminController = require('../controllers/adminController');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Admin Routes - เส้นทางสำหรับ admin interface
 */

// GET /admin - Redirect to dashboard
router.get('/', adminController.showAdmin);

// GET /admin/dashboard - Show admin dashboard
router.get('/dashboard', adminController.showDashboard);

// GET /admin/messaging-settings - Show messaging settings admin page
router.get('/messaging-settings', adminController.showMessagingSettings);

// Log all admin route access
router.use((req, res, next) => {
  logger.info(`Admin route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

module.exports = router;
