const express = require('express');
const zoneController = require('../controllers/zoneController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

const router = express.Router();

// Apply API key authentication to all zone routes
router.use(apiKeyAuth);

// Zone routes
router.get('/', zoneController.getAllZones);
router.get('/cities', zoneController.getCitiesWithZones);
router.get('/explore', zoneController.getExploreLocations);
router.get('/:id', zoneController.getZoneById);
router.get('/:id/properties', zoneController.getPropertiesByZone);

module.exports = router;
