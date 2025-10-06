const messagingSettingsService = require('../services/messagingSettingsService');
const logger = require('../utils/logger');

class MessagingSettingsController {
  // GET /api/messaging-settings - Get all messaging settings
  async getAllSettings(req, res) {
    try {
      const { enabled } = req.query;
      const options = {};
      
      if (enabled !== undefined) {
        options.enabled = enabled === 'true';
      }

      const result = await messagingSettingsService.getAllSettings(options);
      
      res.status(200).json({
        status: 'success',
        message: 'Messaging settings retrieved successfully',
        ...result
      });
    } catch (error) {
      logger.error('Error in getAllSettings controller:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve messaging settings'
      });
    }
  }

  // GET /api/messaging-settings/:id - Get messaging setting by ID
  async getSettingById(req, res) {
    try {
      const { id } = req.params;
      const result = await messagingSettingsService.getSettingById(id);
      
      res.status(200).json({
        status: 'success',
        message: 'Messaging setting retrieved successfully',
        ...result
      });
    } catch (error) {
      logger.error('Error in getSettingById controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to retrieve messaging setting'
      });
    }
  }

  // GET /api/messaging-settings/platform/:platform - Get messaging setting by platform
  async getSettingByPlatform(req, res) {
    try {
      const { platform } = req.params;
      const result = await messagingSettingsService.getSettingByPlatform(platform);
      
      res.status(200).json({
        status: 'success',
        message: 'Messaging setting retrieved successfully',
        ...result
      });
    } catch (error) {
      logger.error('Error in getSettingByPlatform controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to retrieve messaging setting'
      });
    }
  }

  // POST /api/messaging-settings - Create new messaging setting
  async createSetting(req, res) {
    try {
      const result = await messagingSettingsService.createSetting(req.body);
      
      res.status(201).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      logger.error('Error in createSetting controller:', error);
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to create messaging setting'
      });
    }
  }

  // PUT /api/messaging-settings/:id - Update messaging setting
  async updateSetting(req, res) {
    try {
      const { id } = req.params;
      const result = await messagingSettingsService.updateSetting(id, req.body);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      logger.error('Error in updateSetting controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to update messaging setting'
      });
    }
  }

  // DELETE /api/messaging-settings/:id - Delete messaging setting
  async deleteSetting(req, res) {
    try {
      const { id } = req.params;
      const result = await messagingSettingsService.deleteSetting(id);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      logger.error('Error in deleteSetting controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to delete messaging setting'
      });
    }
  }

  // PATCH /api/messaging-settings/:id/toggle - Toggle messaging setting status
  async toggleSettingStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_enabled } = req.body;
      
      if (typeof is_enabled !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: 'is_enabled must be a boolean value'
        });
      }

      const result = await messagingSettingsService.toggleSettingStatus(id, is_enabled);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      logger.error('Error in toggleSettingStatus controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to toggle messaging setting status'
      });
    }
  }

  // GET /api/messaging-settings/enabled - Get enabled messaging settings
  async getEnabledSettings(req, res) {
    try {
      const result = await messagingSettingsService.getEnabledSettings();
      
      res.status(200).json({
        status: 'success',
        message: 'Enabled messaging settings retrieved successfully',
        ...result
      });
    } catch (error) {
      logger.error('Error in getEnabledSettings controller:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve enabled messaging settings'
      });
    }
  }

  // PUT /api/messaging-settings/bulk - Update multiple messaging settings
  async updateMultipleSettings(req, res) {
    try {
      const { settings } = req.body;
      
      if (!Array.isArray(settings)) {
        return res.status(400).json({
          status: 'error',
          message: 'Settings must be an array'
        });
      }

      const result = await messagingSettingsService.updateMultipleSettings(settings);
      
      const statusCode = result.success ? 200 : 207; // 207 = Multi-Status
      res.status(statusCode).json({
        status: result.success ? 'success' : 'partial_success',
        ...result
      });
    } catch (error) {
      logger.error('Error in updateMultipleSettings controller:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update messaging settings'
      });
    }
  }


}

module.exports = new MessagingSettingsController();
