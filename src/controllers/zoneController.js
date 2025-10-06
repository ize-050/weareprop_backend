const zoneService = require('../services/zoneService');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Zone Controller - Handles HTTP requests for zones
 */
class ZoneController {
  /**
   * Get all zones
   * @route GET /api/zones
   */
  async getAllZones(req, res, next) {
    try {
      const zones = await zoneService.getAllZones(req.query);
      res.status(200).json({
        status: 'success',
        data: zones
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get zone by ID
   * @route GET /api/zones/:id
   */
  async getZoneById(req, res, next) {
    try {
      const { id } = req.params;
      const zone = await zoneService.getZoneById(id);
      
      res.status(200).json({
        status: 'success',
        data: zone
      });
    } catch (error) {
      if (error.message === 'Zone not found') {
        return next(new ApiError(404, error.message));
      }
      next(error);
    }
  }

  /**
   * Get properties by zone ID
   * @route GET /api/zones/:id/properties
   */
  async getPropertiesByZone(req, res, next) {
    try {
      const { id } = req.params;
      const properties = await zoneService.getPropertiesByZone(id, req.query);
      
      res.status(200).json({
        status: 'success',
        ...properties
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cities with zones
   * @route GET /api/zones/cities
   */
  async getCitiesWithZones(req, res, next) {
    try {
      const citiesWithZones = await zoneService.getCitiesWithZones();
      
      res.status(200).json({
        status: 'success',
        data: citiesWithZones
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get random zones with property counts for Explore Locations
   * @route GET /api/zones/explore
   */
  async getExploreLocations(req, res, next) {
    try {
      const { limit = 16 } = req.query;
      const randomZones = await zoneService.getRandomZonesWithPropertyCounts(Number(limit));
      
      res.status(200).json({
        status: 'success',
        data: randomZones
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ZoneController();
