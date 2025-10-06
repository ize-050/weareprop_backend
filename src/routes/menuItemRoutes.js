const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const menuItemController = require('../controllers/menuItemController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get all menu items
router.get('/', authenticate, menuItemController.getAllMenuItems);

// Get active menu items (public endpoint - no authentication required)
router.get('/active', menuItemController.getActiveMenuItems);

// Get menu item by ID
router.get('/:id', authenticate, menuItemController.getMenuItemById);

// Create a new menu item
router.post('/',
  authenticate,
  [
    body('path').notEmpty().withMessage('Path is required'),
    body('labelSlug').notEmpty().withMessage('Label slug is required')
  ],
  menuItemController.createMenuItem
);

// Update a menu item
router.put('/:id',
  authenticate,
  [
    body('path').notEmpty().withMessage('Path is required'),
    body('labelSlug').notEmpty().withMessage('Label slug is required')
  ],
  menuItemController.updateMenuItem
);

// Delete a menu item
router.delete('/:id', authenticate, menuItemController.deleteMenuItem);

module.exports = router;
