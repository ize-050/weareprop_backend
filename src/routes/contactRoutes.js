const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken } = require('../middleware/authMiddleware');

// Create contact (public route - ไม่ต้องการการยืนยันตัวตน)
router.post('/', contactController.createContact);

// Admin routes (ต้องการการยืนยันตัวตน)
router.get('/property/:propertyId', verifyToken, contactController.getContactsByPropertyId);
router.get('/', verifyToken, contactController.getAllContacts);

module.exports = router;
