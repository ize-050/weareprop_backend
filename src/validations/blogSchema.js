const { body } = require('express-validator');

/**
 * Validation schema สำหรับการสร้างและอัปเดตบทความ
 */
const blogValidationSchema = [
  // ตรวจสอบชื่อบทความภาษาอังกฤษ (หลัก)
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  // ตรวจสอบเนื้อหาบทความภาษาอังกฤษ (หลัก)
  body('content')
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Content must be a string'),
  
  // ตรวจสอบหมวดหมู่ (ถ้ามี)
  body('category')
    .optional()
    .isString().withMessage('Category must be a string')
    .isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  
  // ตรวจสอบแท็ก (ถ้ามี)
  body('tags')
    .optional()
    .isString().withMessage('Tags must be a string')
    .isLength({ max: 200 }).withMessage('Tags must be less than 200 characters'),
  
  // ตรวจสอบสถานะ
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
  
 
  
  // ตรวจสอบข้อมูลภาษาไทย (ถ้ามี)
  body('th.title')
    .optional()
    .isString().withMessage('Thai title must be a string')
    .isLength({ max: 200 }).withMessage('Thai title must be less than 200 characters'),
  
  body('th.content')
    .optional()
    .isString().withMessage('Thai content must be a string'),
  
  // ตรวจสอบข้อมูลภาษาจีน (ถ้ามี)
  body('zh.title')
    .optional()
    .isString().withMessage('Chinese title must be a string')
    .isLength({ max: 200 }).withMessage('Chinese title must be less than 200 characters'),
  
  body('zh.content')
    .optional()
    .isString().withMessage('Chinese content must be a string'),
  
  // ตรวจสอบข้อมูลภาษารัสเซีย (ถ้ามี)
  body('ru.title')
    .optional()
    .isString().withMessage('Russian title must be a string')
    .isLength({ max: 200 }).withMessage('Russian title must be less than 200 characters'),
  
  body('ru.content')
    .optional()
    .isString().withMessage('Russian content must be a string'),
];

module.exports = {
  blogValidationSchema
};
