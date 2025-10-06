const express = require('express');
const messagingSettingsController = require('../controllers/messagingSettingsController');

const router = express.Router();

// GET /api/messaging-settings - Get all messaging settings
router.get('/', messagingSettingsController.getAllSettings);

// GET /api/messaging-settings/enabled - Get enabled messaging settings
router.get('/enabled', messagingSettingsController.getEnabledSettings);

// GET /api/messaging-settings/platform/:platform - Get messaging setting by platform
router.get('/platform/:platform', messagingSettingsController.getSettingByPlatform);

// GET /api/messaging-settings/:id - Get messaging setting by ID
router.get('/:id', messagingSettingsController.getSettingById);

// POST /api/messaging-settings - Create new messaging setting
router.post('/', messagingSettingsController.createSetting);



// PUT /api/messaging-settings/bulk - Update multiple messaging settings
router.put('/bulk', messagingSettingsController.updateMultipleSettings);

// PUT /api/messaging-settings/:id - Update messaging setting
router.put('/:id', messagingSettingsController.updateSetting);

// PATCH /api/messaging-settings/:id/toggle - Toggle messaging setting status
router.patch('/:id/toggle', messagingSettingsController.toggleSettingStatus);

// DELETE /api/messaging-settings/:id - Delete messaging setting
router.delete('/:id', messagingSettingsController.deleteSetting);

module.exports = router;
