const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

/**
 * @route GET /api/translations/locales
 * @desc Get available locales
 * @access Public
 */
router.get('/locales', translationController.getAvailableLocales);

/**
 * @route GET /api/translations/all
 * @desc Get all translations for all sections
 * @access Public
 * @query locale - Optional locale parameter (en, th, zhCN, ru)
 */
router.get('/all', translationController.getAllTranslations);

/**
 * @route GET /api/translations/:section
 * @desc Get translations for a specific section
 * @access Public
 * @param section - Section name (header, home, about, contact)
 * @query locale - Optional locale parameter (en, th, zhCN, ru)
 */
router.get('/:section', translationController.getTranslationsBySection);

module.exports = router;
