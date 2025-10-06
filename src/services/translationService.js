const translationRepository = require('../repositories/translationRepository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class TranslationService {
  /**
   * Get translations for a specific section
   * @param {string} section - Section name (header, home, about, contact)
   * @param {string} locale - Locale code (en, th, zhCN, ru)
   * @returns {Object} Translations object with key-value pairs
   */
  async getTranslationsBySection(section, locale = 'en') {
    try {
      if (!section) {
        throw new BadRequestError('Section is required');
      }

      // Validate locale
      const validLocales = ['en', 'th', 'zhCN', 'ru'];
      if (!validLocales.includes(locale)) {
        throw new BadRequestError(`Invalid locale. Must be one of: ${validLocales.join(', ')}`);
      }

      const translations = await translationRepository.getBySection(section);
      
      if (!translations || translations.length === 0) {
        return {};
      }

      // Transform array to key-value object
      const translationObject = {};
      translations.forEach(item => {
        translationObject[item.slug] = {
          en: item.en || '',
          th: item.th || '',
          zhCN: item.zhCN || '',
          ru: item.ru || ''
        };
      });

      return translationObject;
    } catch (error) {
      console.error('Error getting translations by section:', error);
      throw error;
    }
  }

  /**
   * Get all translations grouped by section
   * @param {string} locale - Locale code (optional)
   * @returns {Object} All translations grouped by section
   */
  async getAllTranslations(locale = 'en') {
    try {
      // Validate locale
      const validLocales = ['en', 'th', 'zhCN', 'ru'];
      if (!validLocales.includes(locale)) {
        throw new BadRequestError(`Invalid locale. Must be one of: ${validLocales.join(', ')}`);
      }

      const allTranslations = await translationRepository.getAll();
      
      if (!allTranslations || allTranslations.length === 0) {
        return {};
      }

      // Group by section and transform to key-value structure
      const groupedTranslations = {};
      
      allTranslations.forEach(item => {
        if (!groupedTranslations[item.section]) {
          groupedTranslations[item.section] = {};
        }
        
        groupedTranslations[item.section][item.slug] = {
          en: item.en || '',
          th: item.th || '',
          zhCN: item.zhCN || '',
          ru: item.ru || ''
        };
      });

      return groupedTranslations;
    } catch (error) {
      console.error('Error getting all translations:', error);
      throw error;
    }
  }

  /**
   * Get available locales from the database
   * @returns {Array} Array of available locale codes
   */
  async getAvailableLocales() {
    try {
      // For now, return static list based on table structure
      // Could be made dynamic by checking which columns have data
      return [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'th', name: 'ไทย', flag: '🇹🇭' },
        { code: 'zhCN', name: '中文', flag: '🇨🇳' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' }
      ];
    } catch (error) {
      console.error('Error getting available locales:', error);
      throw error;
    }
  }

  /**
   * Get translation by section and slug
   * @param {string} section - Section name
   * @param {string} slug - Translation key
   * @param {string} locale - Locale code
   * @returns {string} Translated string
   */
  async getTranslationString(section, slug, locale = 'en') {
    try {
      if (!section || !slug) {
        throw new BadRequestError('Section and slug are required');
      }

      const translation = await translationRepository.getBySlug(section, slug);
      
      if (!translation) {
        console.warn(`Translation not found for section: ${section}, slug: ${slug}`);
        return slug; // Return slug as fallback
      }

      // Return translation for requested locale or fallback to English
      return translation[locale] || translation.en || slug;
    } catch (error) {
      console.error('Error getting translation string:', error);
      return slug; // Return slug as fallback on error
    }
  }
}

module.exports = new TranslationService();
