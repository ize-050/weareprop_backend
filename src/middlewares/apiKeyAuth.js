/**
 * API Key Authentication Middleware
 * Validates the API key in the request header
 */

const { ApiError } = require('./errorHandler');

// API key should be stored in environment variables in production
const API_KEY = process.env.API_KEY || 'dd-property-api-key-2025';

/**
 * Middleware to validate API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new ApiError(401, 'API key is missing', false));
  }
  
  if (apiKey !== API_KEY) {
    return next(new ApiError(403, 'Invalid API key', false));
  }
  
  next();
};

module.exports = apiKeyAuth;
