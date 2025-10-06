const { AppError } = require('./errors');

/**
 * Global error handler for API responses
 * @param {Error} error - The error object
 * @param {Response} res - Express response object
 * @returns {Response} - Express response with appropriate error status and message
 */
const handleError = (error, res) => {
  console.error('Error occurred:', error);
  
  // Operational errors (expected errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message
    });
  }

  // Prisma database errors
  if (error.code && error.code.startsWith('P')) {
    let message = 'Database error';
    let statusCode = 500;

    // Handle common Prisma errors
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        message = 'A record with this information already exists';
        statusCode = 409;
        break;
      case 'P2025': // Record not found
        message = 'Record not found';
        statusCode = 404;
        break;
      default:
        message = 'Database operation failed';
    }

    return res.status(statusCode).json({
      success: false,
      status: 'error',
      message
    });
  }

  // Default for unexpected errors
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong'
  });
};

module.exports = {
  handleError
};
