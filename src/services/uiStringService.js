const uiStringRepository = require('../repositories/uiStringRepository');

/**
 * Get all UI strings
 */
exports.getAllUiStrings = async () => {
  return await uiStringRepository.getAllUiStrings();
};

/**
 * Get UI strings by section
 */
exports.getUiStringsBySection = async (section) => {
  return await uiStringRepository.getUiStringsBySection(section);
};

/**
 * Get UI string by ID
 */
exports.getUiStringById = async (id) => {
  return await uiStringRepository.getUiStringById(id);
};

/**
 * Get UI string by slug
 */
exports.getUiStringBySlug = async (slug) => {
  return await uiStringRepository.getUiStringBySlug(slug);
};

/**
 * Create a new UI string
 */
exports.createUiString = async (stringData) => {
  // Validate required fields
  if (!stringData.section || !stringData.slug || !stringData.en || !stringData.th) {
    throw new Error('Section, slug, English and Thai texts are required');
  }
  
  return await uiStringRepository.createUiString(stringData);
};

/**
 * Update a UI string
 */
exports.updateUiString = async (id, stringData) => {
  // Validate required fields
  if (!stringData.section || !stringData.slug || !stringData.en || !stringData.th) {
    throw new Error('Section, slug, English and Thai texts are required');
  }
  
  return await uiStringRepository.updateUiString(id, stringData);
};

/**
 * Delete a UI string
 */
exports.deleteUiString = async (id) => {
  return await uiStringRepository.deleteUiString(id);
};
