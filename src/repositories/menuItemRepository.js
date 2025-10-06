const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all menu items
 */
exports.getAllMenuItems = async () => {
  return await prisma.menuItem.findMany({
    orderBy: {
      sortOrder: 'asc'
    },
    include: {
      label: true
    }
  });
};

/**
 * Get active menu items
 */
exports.getActiveMenuItems = async () => {
  return await prisma.menuItem.findMany({
    where: {
      active: true
    },
    orderBy: {
      sortOrder: 'asc'
    },
    include: {
      label: true
    }
  });
};

/**
 * Get menu item by ID
 */
exports.getMenuItemById = async (id) => {
  return await prisma.menuItem.findUnique({
    where: {
      id: id
    },
    include: {
      label: true
    }
  });
};

/**
 * Get menu item by path
 */
exports.getMenuItemByPath = async (path) => {
  return await prisma.menuItem.findUnique({
    where: {
      path: path
    }
  });
};

/**
 * Create a new menu item
 */
exports.createMenuItem = async (menuItemData) => {
  return await prisma.menuItem.create({
    data: menuItemData,
    include: {
      label: true
    }
  });
};

/**
 * Update a menu item
 */
exports.updateMenuItem = async (id, menuItemData) => {
  return await prisma.menuItem.update({
    where: {
      id: id
    },
    data: menuItemData,
    include: {
      label: true
    }
  });
};

/**
 * Delete a menu item
 */
exports.deleteMenuItem = async (id) => {
  return await prisma.menuItem.delete({
    where: {
      id: id
    }
  });
};
