const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * Messaging Settings Repository - จัดการการเข้าถึงฐานข้อมูลสำหรับการตั้งค่า messaging platforms
 */
class MessagingSettingsRepository {
  constructor() {
    this.prisma = prisma;
  }

  async initializeTable() {
    try {
      // Initialize table using Prisma
      await this.prisma.$executeRaw`CREATE TABLE IF NOT EXISTS messaging_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) NOT NULL UNIQUE COMMENT 'Platform name: email, line, whatsapp, wechat, messenger, instagram',
        platform_value TEXT DEFAULT NULL COMMENT 'Platform contact value (email, phone, username, etc.)',
        is_enabled BOOLEAN DEFAULT false COMMENT 'Whether this platform is enabled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_platform (platform),
        INDEX idx_enabled (is_enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Messaging and social media platform settings'`;

      // Insert default platforms if table is empty
      await this.insertDefaultPlatforms();
      
      logger.info('MessagingSettings table initialized successfully');
    } catch (error) {
      logger.error('Error initializing MessagingSettings table:', error);
      throw error;
    }
  }

  async insertDefaultPlatforms() {
    try {
      const defaultPlatforms = [
        { platform: 'email', platformValue: '', isEnabled: false },
        { platform: 'line', platformValue: '', isEnabled: false },
        { platform: 'whatsapp', platformValue: '', isEnabled: false },
        { platform: 'wechat', platformValue: '', isEnabled: false },
        { platform: 'messenger', platformValue: '', isEnabled: false },
        { platform: 'instagram', platformValue: '', isEnabled: false }
      ];

      for (const platformData of defaultPlatforms) {
        const existing = await this.findByPlatform(platformData.platform);
        if (!existing) {
          await this.create(platformData);
          logger.info(`Inserted default platform: ${platformData.platform}`);
        }
      }
    } catch (error) {
      logger.error('Error inserting default platforms:', error);
      // Don't throw error here as it's not critical
    }
  }

  // Get all messaging settings
  async findAll(options = {}) {
    try {
      const { enabled } = options;
      const where = {};

      if (enabled !== undefined) {
        where.isEnabled = enabled;
      }

      return await prisma.messagingSettings.findMany({
        where,
        orderBy: { platform: 'asc' }
      });
    } catch (error) {
      logger.error('Error in findAll:', error);
      throw error;
    }
  }

  // Get messaging setting by ID
  async findById(id) {
    try {
      return await prisma.messagingSettings.findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      logger.error('Error in findById:', error);
      throw error;
    }
  }

  // Get messaging setting by platform
  async findByPlatform(platform) {
    try {
      return await prisma.messagingSettings.findUnique({
        where: { platform }
      });
    } catch (error) {
      logger.error('Error in findByPlatform:', error);
      throw error;
    }
  }

  // Get enabled messaging settings
  async findEnabled() {
    try {
      return await prisma.messagingSettings.findMany({
        where: { isEnabled: true },
        orderBy: { platform: 'asc' }
      });
    } catch (error) {
      logger.error('Error in findEnabled:', error);
      throw error;
    }
  }

  // Create new messaging setting
  async create(data) {
    try {
      const {
        platform,
        platformValue = '',
        isEnabled = false
      } = data;

      return await prisma.messagingSettings.create({
        data: {
          platform,
          platformValue,
          isEnabled
        }
      });
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  }

  // Update messaging setting
  async update(id, data) {
    try {
      const updateData = {};
      const allowedFields = ['platform', 'platformValue', 'isEnabled'];

      for (const field of allowedFields) {
        if (data.hasOwnProperty(field)) {
          updateData[field] = data[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      return await prisma.messagingSettings.update({
        where: { id: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  }

  // Delete messaging setting
  async delete(id) {
    try {
      await prisma.messagingSettings.delete({
        where: { id: parseInt(id) }
      });

      return { success: true, deletedId: id };
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  }

  // Update multiple messaging settings
  async updateMultiple(settingsArray) {
    try {
      const results = [];
      const errors = [];

      for (const setting of settingsArray) {
        try {
          const { id, ...updateData } = setting;
          if (!id) {
            errors.push({ setting, error: 'ID is required' });
            continue;
          }

          const result = await this.update(id, updateData);
          results.push(result);
        } catch (error) {
          errors.push({ setting, error: error.message });
        }
      }

      return {
        success: errors.length === 0,
        updated: results,
        errors: errors
      };
    } catch (error) {
      logger.error('Error in updateMultiple:', error);
      throw error;
    }
  }

  // Toggle messaging setting status
  async toggleStatus(id, isEnabled) {
    try {
      return await this.update(id, { isEnabled });
    } catch (error) {
      logger.error('Error in toggleStatus:', error);
      throw error;
    }
  }

  // Get messaging settings count
  async getCount(options = {}) {
    try {
      const { enabled } = options;
      const where = {};

      if (enabled !== undefined) {
        where.isEnabled = enabled;
      }

      return await prisma.messagingSettings.count({ where });
    } catch (error) {
      logger.error('Error in getCount:', error);
      throw error;
    }
  }
}

module.exports = new MessagingSettingsRepository();
