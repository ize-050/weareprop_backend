const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Currency Service - จัดการการทำงานเกี่ยวกับอัตราแลกเปลี่ยนสกุลเงิน
 */
class CurrencyService {
  /**
   * ดึงข้อมูลอัตราแลกเปลี่ยนทั้งหมด
   * @returns {Promise<Array>} รายการอัตราแลกเปลี่ยนทั้งหมด
   */
  async getAllCurrencies() {
    try {
      const currencyRates = await prisma.currencyRate.findMany({
        orderBy: [
          { isBase: 'desc' },
          { currency: 'asc' }
        ]
      });

      return currencyRates;
    } catch (error) {
      console.error('Error in getAllCurrencies:', error);
      throw new ApiError(500, 'Failed to fetch currency rates');
    }
  }

  /**
   * อัปเดตอัตราแลกเปลี่ยน
   * @param {Array} currencyData ข้อมูลอัตราแลกเปลี่ยนที่ต้องการอัปเดต
   * @returns {Promise<Array>} ผลลัพธ์การอัปเดต
   */
  async updateCurrencies(currencyData) {
    try {
      if (!Array.isArray(currencyData)) {
        throw new ApiError(400, 'Currency data must be an array');
      }

      const updatePromises = currencyData.map(async (data) => {
        // ตรวจสอบข้อมูล
        if (!data.currency || !data.rate) {
          throw new ApiError(400, 'Currency and rate are required');
        }

        // ไม่อนุญาตให้แก้ไขอัตราของ THB
        if (data.currency === 'THB' && parseFloat(data.rate) !== 1) {
          data.rate = 1;
        }

        // อัปเดตหรือสร้างข้อมูลใหม่
        return prisma.currencyRate.upsert({
          where: {
            currency: data.currency
          },
          update: {
            rate: parseFloat(data.rate),
            name: data.name || this.getCurrencyName(data.currency),
            isBase: data.currency === 'THB'
          },
          create: {
            currency: data.currency,
            rate: parseFloat(data.rate),
            name: data.name || this.getCurrencyName(data.currency),
            isBase: data.currency === 'THB'
          }
        });
      });

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error in updateCurrencies:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update currency rates');
    }
  }

  /**
   * เพิ่มข้อมูลเริ่มต้นของอัตราแลกเปลี่ยน
   * @returns {Promise<Array>} ผลลัพธ์การเพิ่มข้อมูล
   */
  async seedCurrencies() {
    try {
      // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
      const existingCurrencies = await prisma.currencyRate.findMany();

      if (existingCurrencies.length > 0) {
        return existingCurrencies;
      }

      // ข้อมูลเริ่มต้น
      const defaultCurrencies = [
        { currency: 'THB', rate: 1.00, name: 'BATH', isBase: true },
        { currency: 'USD', rate: 0.028, name: 'US DOLLAR', isBase: false },
        { currency: 'CNY', rate: 0.20, name: 'YUAN', isBase: false },
        { currency: 'RUB', rate: 2.50, name: 'RUBLE', isBase: false },
        { currency: 'GBP', rate: 2.24, name: 'POUND', isBase: false },
        { currency: 'EUR', rate: 2.63, name: 'EUR', isbase: false },
      ];

      // สร้างข้อมูลทีละรายการเพื่อหลีกเลี่ยงปัญหากับ enum
      const createPromises = defaultCurrencies.map(async (currency) => {
        return prisma.currencyRate.create({
          data: {
            currency: currency.currency,
            rate: currency.rate,
            name: currency.name,
            isBase: currency.isBase
          }
        });
      });

      const results = await Promise.all(createPromises);
      return results;
    } catch (error) {
      console.error('Error in seedCurrencies:', error);
      throw new ApiError(500, 'Failed to seed currency data');
    }
  }

  /**
   * ดึงชื่อสกุลเงินจากรหัส
   * @param {string} currency รหัสสกุลเงิน
   * @returns {string} ชื่อสกุลเงิน
   */
  getCurrencyName(currency) {
    const names = {
      'THB': 'BATH',
      'USD': 'US DOLLAR',
      'CNY': 'YUAN',
      'RUB': 'RUBLE'
    };

    return names[currency] || currency;
  }
}

module.exports = new CurrencyService();
