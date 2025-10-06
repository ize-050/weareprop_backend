const express = require('express');
const propertyRoutes = require('./propertyRoutes');
const zoneRoutes = require('./zoneRoutes');
const searchRoutes = require('./searchRoutes');
// const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes');
const currencyRoutes = require('./currencyRoutes');
const userRoutes = require('./userRoutes'); // Assuming userRoutes is defined in userRoutes.js
const messageRoutes = require('./messageRoutes'); // เปลี่ยนจาก contactRoutes เป็น messageRoutes
const contactFormRoutes = require('./contactFormRoutes'); // เพิ่ม contactFormRoutes สำหรับ contact form
const dashboardRoutes = require('./dashboardRoutes'); // เพิ่ม dashboardRoutes
const iconRoutes = require('./iconRoutes'); // เพิ่ม iconRoutes
const uiStringRoutes = require('./uiStringRoutes'); // เพิ่ม uiStringRoutes สำหรับการจัดการภาษา
const menuItemRoutes = require('./menuItemRoutes'); // เพิ่ม menuItemRoutes สำหรับการจัดการเมนู
const propertyTypeRoutes = require('./propertyTypeRoutes'); // เพิ่ม propertyTypeRoutes สำหรับการจัดการประเภทอสังหาริมทรัพย์
const messagingSettingsRoutes = require('./messagingSettingsRoutes'); // เพิ่ม messagingSettingsRoutes สำหรับการจัดการ messaging settings

const router = express.Router();

// API routes
router.use('/properties', propertyRoutes);
router.use('/zones', zoneRoutes);
router.use('/search', searchRoutes);
// router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/users', userRoutes); // Assuming userRoutes is defined in userRoutes.js
router.use('/currencies', currencyRoutes);
router.use('/messages', messageRoutes); // เปลี่ยนจาก '/contacts' เป็น '/messages'
router.use('/contact-form', contactFormRoutes); // เพิ่ม contact form routes
router.use('/dashboard', dashboardRoutes); // เพิ่ม dashboard routes
router.use('/icons', iconRoutes); // เพิ่ม icon routes
router.use('/ui-strings', uiStringRoutes); // เพิ่ม UI strings routes สำหรับการจัดการภาษา
router.use('/menu-items', menuItemRoutes); // เพิ่ม menu items routes สำหรับการจัดการเมนู
router.use('/messaging-settings', messagingSettingsRoutes); // เพิ่ม messaging settings routes สำหรับการจัดการ messaging settings
router.use('/', propertyTypeRoutes); // เพิ่ม property type routes

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to DD Property API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

module.exports = router;
