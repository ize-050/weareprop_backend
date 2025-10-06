const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translateController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/translate
// @desc    Translate text
// @access  Private
router.post('/', authMiddleware.authenticate, translateController.translateText);

module.exports = router;
