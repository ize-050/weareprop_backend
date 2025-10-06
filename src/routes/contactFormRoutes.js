const express = require('express');
const router = express.Router();
const contactFormController = require('../controllers/contactFormController');

// Submit contact form (public route - ไม่ต้องการการยืนยันตัวตน)
router.post('/', contactFormController.submitContactForm);

module.exports = router;
