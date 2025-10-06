const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TranslationRepository {
  /**
   * Get all translations from ui_string table
   * @returns {Array} Array of translation objects
   */
  async getAll() {
    try {
      const translations = await prisma.$queryRaw`
        SELECT * FROM ui_string 
        ORDER BY section, slug
      `;
      
      return translations;
    } catch (error) {
      console.error('Error fetching all translations:', error);
      throw error;
    }
  }

  /**
   * Get translations by section
   * @param {string} section - Section name (header, home, about, contact)
   * @returns {Array} Array of translation objects for the section
   */
  async getBySection(section) {
    try {
      const translations = await prisma.$queryRaw`
        SELECT * FROM ui_string 
        WHERE section = ${section}
        ORDER BY slug
      `;
      
      return translations;
    } catch (error) {
      console.error('Error fetching translations by section:', error);
      throw error;
    }
  }

  /**
   * Get translation by section and slug
   * @param {string} section - Section name
   * @param {string} slug - Translation key
   * @returns {Object|null} Translation object or null if not found
   */
  async getBySlug(section, slug) {
    try {
      const translation = await prisma.$queryRaw`
        SELECT * FROM ui_string 
        WHERE section = ${section} AND slug = ${slug}
        LIMIT 1
      `;
      
      return translation.length > 0 ? translation[0] : null;
    } catch (error) {
      console.error('Error fetching translation by slug:', error);
      throw error;
    }
  }

  /**
   * Get all distinct sections
   * @returns {Array} Array of section names
   */
  async getSections() {
    try {
      const sections = await prisma.$queryRaw`
        SELECT DISTINCT section FROM ui_string 
        ORDER BY section
      `;
      
      return sections.map(item => item.section);
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  /**
   * Create or update translation
   * @param {Object} translationData - Translation data
   * @returns {Object} Created/updated translation
   */
  async createOrUpdate(translationData) {
    try {
      const { section, slug, en, th, zhCN, ru } = translationData;
      
      // Check if translation exists
      const existing = await this.getBySlug(section, slug);
      
      if (existing) {
        // Update existing translation
        const updated = await prisma.$queryRaw`
          UPDATE ui_string 
          SET en = ${en || existing.en}, 
              th = ${th || existing.th}, 
              zhCN = ${zhCN || existing.zhCN}, 
              ru = ${ru || existing.ru},
              updated_at = NOW()
          WHERE section = ${section} AND slug = ${slug}
        `;
        
        return await this.getBySlug(section, slug);
      } else {
        // Create new translation
        await prisma.$queryRaw`
          INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at)
          VALUES (${section}, ${slug}, ${en || ''}, ${th || ''}, ${zhCN || ''}, ${ru || ''}, NOW(), NOW())
        `;
        
        return await this.getBySlug(section, slug);
      }
    } catch (error) {
      console.error('Error creating/updating translation:', error);
      throw error;
    }
  }

  /**
   * Delete translation by section and slug
   * @param {string} section - Section name
   * @param {string} slug - Translation key
   * @returns {boolean} Success status
   */
  async delete(section, slug) {
    try {
      await prisma.$queryRaw`
        DELETE FROM ui_string 
        WHERE section = ${section} AND slug = ${slug}
      `;
      
      return true;
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  }

  /**
   * Search translations by text content
   * @param {string} searchText - Text to search for
   * @param {string} locale - Locale to search in (optional)
   * @returns {Array} Array of matching translations
   */
  async search(searchText, locale = null) {
    try {
      let query;
      
      if (locale && ['en', 'th', 'zhCN', 'ru'].includes(locale)) {
        // Search in specific locale
        query = prisma.$queryRaw`
          SELECT * FROM ui_string 
          WHERE ${locale} LIKE ${`%${searchText}%`}
          ORDER BY section, slug
        `;
      } else {
        // Search in all locales
        query = prisma.$queryRaw`
          SELECT * FROM ui_string 
          WHERE en LIKE ${`%${searchText}%`} 
             OR th LIKE ${`%${searchText}%`} 
             OR zhCN LIKE ${`%${searchText}%`} 
             OR ru LIKE ${`%${searchText}%`}
          ORDER BY section, slug
        `;
      }
      
      return await query;
    } catch (error) {
      console.error('Error searching translations:', error);
      throw error;
    }
  }
}

module.exports = new TranslationRepository();
