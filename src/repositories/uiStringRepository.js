const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all UI strings
 */
exports.getAllUiStrings = async () => {
  return await prisma.uiString.findMany({
    orderBy: [
      { section: 'asc' },
      { slug: 'asc' }
    ]
  });
};

/**
 * Get UI strings by section
 */
exports.getUiStringsBySection = async (section) => {
  return await prisma.uiString.findMany({
    where: {
      section: section
    },
    orderBy: {
      slug: 'asc'
    }
  });
};

/**
 * Get UI string by ID
 */
exports.getUiStringById = async (id) => {
  return await prisma.uiString.findUnique({
    where: {
      id: id
    }
  });
};

/**
 * Get UI string by slug
 */
exports.getUiStringBySlug = async (slug) => {
  return await prisma.uiString.findUnique({
    where: {
      slug: slug
    }
  });
};

/**
 * Create a new UI string
 */
exports.createUiString = async (stringData) => {
  return await prisma.uiString.create({
    data: stringData
  });
};

/**
 * Update a UI string
 */
exports.updateUiString = async (id, stringData) => {
  return await prisma.uiString.update({
    where: {
      id: id
    },
    data: stringData
  });
};

/**
 * Delete a UI string
 */
exports.deleteUiString = async (id) => {
  return await prisma.uiString.delete({
    where: {
      id: id
    }
  });
};
