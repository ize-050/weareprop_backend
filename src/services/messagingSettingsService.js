const messagingSettingsRepository = require('../repositories/messagingSettingsRepository');
const logger = require('../utils/logger');

class MessagingSettingsService {
  async getAllSettings(options = {}) {
    try {
      const settings = await messagingSettingsRepository.findAll(options);
      
      logger.info(`Retrieved ${settings.length} messaging settings`);
      return {
        success: true,
        data: settings,
        total: settings.length
      };
    } catch (error) {
      logger.error('Error in getAllSettings:', error);
      throw new Error('Failed to retrieve messaging settings');
    }
  }

  async getSettingById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid setting ID is required');
      }

      const setting = await messagingSettingsRepository.findById(parseInt(id));
      
      if (!setting) {
        throw new Error('Messaging setting not found');
      }

      logger.info(`Retrieved messaging setting with ID: ${id}`);
      return {
        success: true,
        data: setting
      };
    } catch (error) {
      logger.error('Error in getSettingById:', error);
      throw error;
    }
  }

  async getSettingByPlatform(platform) {
    try {
      if (!platform) {
        throw new Error('Platform name is required');
      }

      const setting = await messagingSettingsRepository.findByPlatform(platform);
      
      if (!setting) {
        throw new Error(`Messaging setting for platform '${platform}' not found`);
      }

      logger.info(`Retrieved messaging setting for platform: ${platform}`);
      return {
        success: true,
        data: setting
      };
    } catch (error) {
      logger.error('Error in getSettingByPlatform:', error);
      throw error;
    }
  }

  async createSetting(data) {
    try {
      // Validate required fields
      const { platform } = data;
      
      if (!platform) {
        throw new Error('Platform is required');
      }

      // Check if platform already exists
      const existingSetting = await messagingSettingsRepository.findByPlatform(platform);
      if (existingSetting) {
        throw new Error(`Platform '${platform}' already exists`);
      }

      // Validate platform name (only allow specific platforms)
      const allowedPlatforms = ['email', 'line', 'whatsapp', 'wechat', 'messenger', 'instagram'];
      if (!allowedPlatforms.includes(platform.toLowerCase())) {
        throw new Error(`Platform '${platform}' is not supported. Allowed platforms: ${allowedPlatforms.join(', ')}`);
      }

      const newSetting = await messagingSettingsRepository.create({
        ...data,
        platform: platform.toLowerCase()
      });

      logger.info(`Created new messaging setting for platform: ${platform}`);
      return {
        success: true,
        data: newSetting,
        message: 'Messaging setting created successfully'
      };
    } catch (error) {
      logger.error('Error in createSetting:', error);
      throw error;
    }
  }

  async updateSetting(id, data) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid setting ID is required');
      }

      // Check if setting exists
      const existingSetting = await messagingSettingsRepository.findById(parseInt(id));
      if (!existingSetting) {
        throw new Error('Messaging setting not found');
      }

      // If platform is being updated, check for duplicates
      if (data.platform && data.platform !== existingSetting.platform) {
        const duplicateSetting = await messagingSettingsRepository.findByPlatform(data.platform);
        if (duplicateSetting && duplicateSetting.id !== parseInt(id)) {
          throw new Error(`Platform '${data.platform}' already exists`);
        }
      }

      const updatedSetting = await messagingSettingsRepository.update(parseInt(id), data);

      logger.info(`Updated messaging setting with ID: ${id}`);
      return {
        success: true,
        data: updatedSetting,
        message: 'Messaging setting updated successfully'
      };
    } catch (error) {
      logger.error('Error in updateSetting:', error);
      throw error;
    }
  }

  async deleteSetting(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid setting ID is required');
      }

      // Check if setting exists
      const existingSetting = await messagingSettingsRepository.findById(parseInt(id));
      if (!existingSetting) {
        throw new Error('Messaging setting not found');
      }

      // Prevent deletion of email platform (core functionality)
      if (existingSetting.platform === 'email') {
        throw new Error('Email platform cannot be deleted as it is required for core functionality');
      }

      const result = await messagingSettingsRepository.delete(parseInt(id));

      logger.info(`Deleted messaging setting with ID: ${id}`);
      return {
        success: true,
        data: result,
        message: 'Messaging setting deleted successfully'
      };
    } catch (error) {
      logger.error('Error in deleteSetting:', error);
      throw error;
    }
  }

  async toggleSettingStatus(id, isEnabled) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid setting ID is required');
      }

      if (typeof isEnabled !== 'boolean') {
        throw new Error('isEnabled must be a boolean value');
      }

      const updatedSetting = await messagingSettingsRepository.updateStatus(parseInt(id), isEnabled);

      logger.info(`Toggled messaging setting status: ID ${id}, enabled: ${isEnabled}`);
      return {
        success: true,
        data: updatedSetting,
        message: `Messaging setting ${isEnabled ? 'enabled' : 'disabled'} successfully`
      };
    } catch (error) {
      logger.error('Error in toggleSettingStatus:', error);
      throw error;
    }
  }

  async getEnabledSettings() {
    try {
      const enabledSettings = await messagingSettingsRepository.getEnabledPlatforms();
      
      logger.info(`Retrieved ${enabledSettings.length} enabled messaging settings`);
      return {
        success: true,
        data: enabledSettings,
        total: enabledSettings.length
      };
    } catch (error) {
      logger.error('Error in getEnabledSettings:', error);
      throw new Error('Failed to retrieve enabled messaging settings');
    }
  }

  async updateMultipleSettings(settingsArray) {
    try {
      if (!Array.isArray(settingsArray)) {
        throw new Error('Settings data must be an array');
      }

      const results = [];
      const errors = [];

      for (const settingData of settingsArray) {
        try {
          const { id, platform, platformValue, isEnabled } = settingData;
          logger.info(`Processing setting: id=${id}, platform=${platform}, value=${platformValue}, enabled=${isEnabled}`);
          
          // Skip empty settings (no value and not enabled)
          if (!platformValue && !isEnabled) {
            logger.info(`Skipping empty setting for platform: ${platform}`);
            continue;
          }

          let result;
          if (id) {
            // Update existing setting by ID
            logger.info(`Updating existing setting by ID: ${id}`);
            result = await this.updateSetting(id, { platformValue, isEnabled });
          } else if (platform) {
            // Try to find existing setting by platform first
            logger.info(`Looking for existing setting by platform: ${platform}`);
            const existingSetting = await messagingSettingsRepository.findByPlatform(platform);
            
            if (existingSetting) {
              // Update existing setting found by platform
              logger.info(`Found existing setting for platform ${platform}, updating ID: ${existingSetting.id}`);
              result = await this.updateSetting(existingSetting.id, { platformValue, isEnabled });
            } else {
              // Create new setting
              logger.info(`Creating new setting for platform: ${platform}`);
              result = await this.createSetting({ platform, platformValue, isEnabled });
            }
          } else {
            logger.error(`Platform is required for new settings, received data:`, settingData);
            errors.push({ error: 'Platform is required for new settings', data: settingData });
            continue;
          }
          
          results.push(result.data);
          logger.info(`Successfully processed setting for platform: ${platform}`);
        } catch (error) {
          logger.error(`Error processing setting for platform ${settingData.platform}:`, error);
          errors.push({ 
            platform: settingData.platform, 
            id: settingData.id, 
            error: error.message 
          });
        }
      }

      logger.info(`Bulk update completed: ${results.length} successful, ${errors.length} errors`);
      return {
        success: errors.length === 0,
        data: results,
        errors: errors,
        message: `Updated ${results.length} settings successfully${errors.length > 0 ? `, ${errors.length} errors occurred` : ''}`
      };
    } catch (error) {
      logger.error('Error in updateMultipleSettings:', error);
      throw error;
    }
  }


}

module.exports = new MessagingSettingsService();
