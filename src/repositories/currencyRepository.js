const db = require('../config/database');

/**
 * Currency Repository - จัดการการเข้าถึงฐานข้อมูลสำหรับอัตราแลกเปลี่ยนสกุลเงิน
 */
class CurrencyRepository {
  /**
   * ดึงข้อมูลอัตราแลกเปลี่ยนทั้งหมด
   * @returns {Promise<Array>} รายการอัตราแลกเปลี่ยนทั้งหมด
   */
  async getAllCurrencies() {
    try {
      const [currencies] = await db.execute(
        `SELECT * FROM currencies ORDER BY is_base DESC, code ASC`
      );
      return currencies;
    } catch (error) {
      console.error('Error in getAllCurrencies:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลอัตราแลกเปลี่ยนตามรหัสสกุลเงิน
   * @param {string} code รหัสสกุลเงิน
   * @returns {Promise<Object>} ข้อมูลอัตราแลกเปลี่ยน
   */
  async getCurrencyByCode(code) {
    try {
      const [currencies] = await db.execute(
        `SELECT * FROM currencies WHERE code = ?`,
        [code]
      );
      return currencies[0] || null;
    } catch (error) {
      console.error('Error in getCurrencyByCode:', error);
      throw error;
    }
  }

  /**
   * อัปเดตอัตราแลกเปลี่ยน
   * @param {string} code รหัสสกุลเงิน
   * @param {number} rate อัตราแลกเปลี่ยน
   * @param {string} name ชื่อสกุลเงิน
   * @param {boolean} isBase เป็นสกุลเงินหลักหรือไม่
   * @returns {Promise<Object>} ผลลัพธ์การอัปเดต
   */
  async updateCurrency(code, rate, name, isBase = false) {
    try {
      const [result] = await db.execute(
        `INSERT INTO currencies (code, rate, name, is_base, updated_at) 
         VALUES (?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         rate = ?, name = ?, is_base = ?, updated_at = NOW()`,
        [code, rate, name, isBase, rate, name, isBase]
      );
      
      return result;
    } catch (error) {
      console.error('Error in updateCurrency:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่าตาราง currencies มีอยู่หรือไม่
   * @returns {Promise<boolean>} ผลการตรวจสอบ
   */
  async checkTableExists() {
    try {
      const [tables] = await db.execute(
        `SHOW TABLES LIKE 'currencies'`
      );
      return tables.length > 0;
    } catch (error) {
      console.error('Error in checkTableExists:', error);
      throw error;
    }
  }

  /**
   * สร้างตาราง currencies
   * @returns {Promise<Object>} ผลลัพธ์การสร้างตาราง
   */
  async createCurrenciesTable() {
    try {
      const [result] = await db.execute(
        `CREATE TABLE IF NOT EXISTS currencies (
          code VARCHAR(10) PRIMARY KEY,
          rate DECIMAL(15, 6) NOT NULL,
          name VARCHAR(50) NOT NULL,
          is_base BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      );
      return result;
    } catch (error) {
      console.error('Error in createCurrenciesTable:', error);
      throw error;
    }
  }
}

module.exports = new CurrencyRepository();
