const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Admin Controller - จัดการหน้า admin interface
 */
class AdminController {
  
  // GET /admin/messaging-settings - Show messaging settings admin page
  async showMessagingSettings(req, res) {
    try {
      const filePath = path.join(__dirname, '../views/admin/messaging-settings.html');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin page not found'
        });
      }

      // Send HTML file
      res.sendFile(filePath);
      logger.info('Messaging settings admin page served');
    } catch (error) {
      logger.error('Error serving messaging settings admin page:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load admin page'
      });
    }
  }

  // GET /admin/dashboard - Show admin dashboard
  async showDashboard(req, res) {
    try {
      // For now, redirect to messaging settings
      res.redirect('/admin/messaging-settings');
    } catch (error) {
      logger.error('Error serving admin dashboard:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load admin dashboard'
      });
    }
  }

  // GET /admin - Redirect to dashboard
  async showAdmin(req, res) {
    try {
      res.redirect('/admin/dashboard');
    } catch (error) {
      logger.error('Error redirecting to admin:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to load admin'
      });
    }
  }
}

module.exports = new AdminController();
