const express = require('express');
const router = express.Router();
const propertyTypeController = require('../controllers/propertyTypeController');


// ดึงข้อมูลประเภทอสังหาริมทรัพย์ทั้งหมด
router.get('/property-types', propertyTypeController.getAllPropertyTypes);

// ดึงข้อมูลประเภทอสังหาริมทรัพย์ตาม ID
router.get('/property-types/:id', propertyTypeController.getPropertyTypeById);

module.exports = router;
