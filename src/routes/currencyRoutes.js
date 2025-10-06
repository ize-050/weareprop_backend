const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const currencyController = require('../controllers/currencyController');

const router = express.Router();

// GET /api/currencies - ดึงข้อมูลอัตราแลกเปลี่ยนทั้งหมด
router.get('/', currencyController.getAllCurrencies);

// POST /api/currencies - อัปเดตอัตราแลกเปลี่ยน (เฉพาะ admin)
router.post('/', authMiddleware.authenticate, currencyController.updateCurrencies);

// GET /api/currencies/seed - เพิ่มข้อมูลเริ่มต้น (เฉพาะ admin)
router.get('/seed', currencyController.seedCurrencies);

module.exports = router;
