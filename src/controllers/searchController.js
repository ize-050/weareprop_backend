const searchService = require('../services/searchService');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Search Controller - Handles HTTP requests for property searching
 */
class SearchController {
  /**
   * Search properties with filters
   * @route GET /api/search/properties
   */
  async searchProperties(req, res, next) {
    try {
      // Map keyword parameter to search for compatibility
      const filters = { ...req.query };
      if (filters.keyword) {
        filters.search = filters.keyword;
        delete filters.keyword;
      }
      
      const properties = await searchService.searchProperties(filters);
      
      res.status(200).json({
        status: 'success',
        ...properties
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
