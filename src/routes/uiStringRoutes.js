const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const uiStringController = require('../controllers/uiStringController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get all UI strings (authenticated)
router.get('/', authenticate, uiStringController.getAllUiStrings);

// Get all UI strings (public endpoint - no authentication required)
router.get('/public', uiStringController.getAllUiStrings);

// Get UI strings by section (authenticated)
router.get('/section/:section', authenticate, uiStringController.getUiStringsBySection);

// Get UI strings by section (public endpoint - no authentication required)
router.get('/public/section/:section', uiStringController.getUiStringsBySection);

// Get UI string by ID
router.get('/:id', authenticate, uiStringController.getUiStringById);

// Create a new UI string
router.post('/',
  authenticate,
  [
    body('section').notEmpty().withMessage('Section is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    body('en').notEmpty().withMessage('English text is required'),
    body('th').notEmpty().withMessage('Thai text is required')
  ],
  uiStringController.createUiString
);

// Update a UI string
router.put('/:id',
  authenticate,
  [
    body('section').notEmpty().withMessage('Section is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    body('en').notEmpty().withMessage('English text is required'),
    body('th').notEmpty().withMessage('Thai text is required')
  ],
  uiStringController.updateUiString
);

// Delete a UI string
router.delete('/:id', authenticate, uiStringController.deleteUiString);

module.exports = router;
