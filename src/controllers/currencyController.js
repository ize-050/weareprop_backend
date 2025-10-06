const currencyService = require('../services/currencyService');
const { ApiError } = require('../middlewares/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Currency Controller - จัดการ HTTP requests สำหรับอัตราแลกเปลี่ยนสกุลเงิน
 */
class CurrencyController {
  /**
   * ดึงข้อมูลอัตราแลกเปลี่ยนทั้งหมด
   * @route GET /api/currencies
   */
  async getAllCurrencies(req, res, next) {
    try {
      const currencies = await currencyService.getAllCurrencies();
      
      res.status(200).json({
        status: 'success',
        data: currencies
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * อัปเดตอัตราแลกเปลี่ยน
   * @route POST /api/currencies
   */
  async updateCurrencies(req, res, next) {
    try {
      // ตรวจสอบความถูกต้องของข้อมูล
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errors.array()
        });
      }
      
      const { currencies } = req.body;
      
      if (!currencies || !Array.isArray(currencies)) {
        throw new ApiError(400, 'Currencies data must be an array');
      }
      
      const updatedCurrencies = await currencyService.updateCurrencies(currencies);
      
      res.status(200).json({
        status: 'success',
        message: 'Currency rates updated successfully',
        data: updatedCurrencies
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * เพิ่มข้อมูลเริ่มต้นของอัตราแลกเปลี่ยน
   * @route GET /api/currencies/seed
   */
  async seedCurrencies(req, res, next) {
    try {
      const result = await currencyService.seedCurrencies();
      
      res.status(200).json({
        status: 'success',
        message: 'Currency data seeded successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CurrencyController();
