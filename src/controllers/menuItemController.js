const menuItemService = require('../services/menuItemService');
const { validationResult } = require('express-validator');

/**
 * Get all menu items
 */
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await menuItemService.getAllMenuItems();
    return res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error getting menu items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get menu items',
      error: error.message
    });
  }
};

/**
 * Get active menu items
 */
exports.getActiveMenuItems = async (req, res) => {
  try {
    const menuItems = await menuItemService.getActiveMenuItems();
    return res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error getting active menu items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get active menu items',
      error: error.message
    });
  }
};

/**
 * Get menu item by ID
 */
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await menuItemService.getMenuItemById(parseInt(id));
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error getting menu item by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get menu item',
      error: error.message
    });
  }
};

/**
 * Create a new menu item
 */
exports.createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const { path, icon, sortOrder, active, labelSlug } = req.body;
    
    // Check if path already exists
    const existingMenuItem = await menuItemService.getMenuItemByPath(path);
    if (existingMenuItem) {
      return res.status(400).json({
        success: false,
        message: 'Path already exists'
      });
    }
    
    const newMenuItem = await menuItemService.createMenuItem({
      path,
      icon: icon || null,
      sortOrder: sortOrder || 0,
      active: active !== undefined ? active : true,
      labelSlug
    });
    
    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newMenuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
};

/**
 * Update a menu item
 */
exports.updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { path, icon, sortOrder, active, labelSlug } = req.body;
    
    // Check if menu item exists
    const existingMenuItem = await menuItemService.getMenuItemById(parseInt(id));
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Check if path already exists (if changing path)
    if (path !== existingMenuItem.path) {
      const pathExists = await menuItemService.getMenuItemByPath(path);
      if (pathExists) {
        return res.status(400).json({
          success: false,
          message: 'Path already exists'
        });
      }
    }
    
    const updatedMenuItem = await menuItemService.updateMenuItem(parseInt(id), {
      path,
      icon: icon || null,
      sortOrder: sortOrder !== undefined ? sortOrder : existingMenuItem.sortOrder,
      active: active !== undefined ? active : existingMenuItem.active,
      labelSlug
    });
    
    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
};

/**
 * Delete a menu item
 */
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if menu item exists
    const existingMenuItem = await menuItemService.getMenuItemById(parseInt(id));
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    await menuItemService.deleteMenuItem(parseInt(id));
    
    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
};
