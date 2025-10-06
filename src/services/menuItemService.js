const menuItemRepository = require('../repositories/menuItemRepository');

/**
 * Get all menu items
 */
exports.getAllMenuItems = async () => {
  return await menuItemRepository.getAllMenuItems();
};

/**
 * Get active menu items
 */
exports.getActiveMenuItems = async () => {
  return await menuItemRepository.getActiveMenuItems();
};

/**
 * Get menu item by ID
 */
exports.getMenuItemById = async (id) => {
  return await menuItemRepository.getMenuItemById(id);
};

/**
 * Get menu item by path
 */
exports.getMenuItemByPath = async (path) => {
  return await menuItemRepository.getMenuItemByPath(path);
};

/**
 * Create a new menu item
 */
exports.createMenuItem = async (menuItemData) => {
  // Validate required fields
  if (!menuItemData.path || !menuItemData.labelSlug) {
    throw new Error('Path and label slug are required');
  }
  
  return await menuItemRepository.createMenuItem(menuItemData);
};

/**
 * Update a menu item
 */
exports.updateMenuItem = async (id, menuItemData) => {
  // Validate required fields
  if (!menuItemData.path || !menuItemData.labelSlug) {
    throw new Error('Path and label slug are required');
  }
  
  return await menuItemRepository.updateMenuItem(id, menuItemData);
};

/**
 * Delete a menu item
 */
exports.deleteMenuItem = async (id) => {
  return await menuItemRepository.deleteMenuItem(id);
};
