const translationService = require('../services/translationService');
const { handleError } = require('../utils/errorHandler');

class TranslationController {
  /**
   * Get all translations for a specific section and locale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTranslationsBySection(req, res, next) {
    try {
      const { section } = req.params;
      const { locale } = req.query;

      if (!section) {
        return res.status(400).json({
          success: false,
          error: 'Section parameter is required'
        });
      }

      const translations = await translationService.getTranslationsBySection(section, locale);
      
      return res.status(200).json({
        success: true,
        data: translations
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  /**
   * Get all translations for all sections (for initial load)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTranslations(req, res, next) {
    try {
      const { locale } = req.query;
      
      const translations = await translationService.getAllTranslations(locale);
      
      return res.status(200).json({
        success: true,
        data: translations
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  /**
   * Get available locales
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableLocales(req, res, next) {
    try {
      const locales = await translationService.getAvailableLocales();
      
      return res.status(200).json({
        success: true,
        data: locales
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

module.exports = new TranslationController();
