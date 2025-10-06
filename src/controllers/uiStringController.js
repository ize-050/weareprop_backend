const uiStringService = require('../services/uiStringService');
const { validationResult } = require('express-validator');

/**
 * Get all UI strings
 */
exports.getAllUiStrings = async (req, res) => {
  try {
    const strings = await uiStringService.getAllUiStrings();
    return res.status(200).json({
      success: true,
      data: strings
    });
  } catch (error) {
    console.error('Error getting UI strings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get UI strings',
      error: error.message
    });
  }
};

/**
 * Get UI strings by section
 */
exports.getUiStringsBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const strings = await uiStringService.getUiStringsBySection(section);
    return res.status(200).json({
      success: true,
      data: strings
    });
  } catch (error) {
    console.error('Error getting UI strings by section:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get UI strings by section',
      error: error.message
    });
  }
};

/**
 * Get UI string by ID
 */
exports.getUiStringById = async (req, res) => {
  try {
    const { id } = req.params;
    const string = await uiStringService.getUiStringById(parseInt(id));
    
    if (!string) {
      return res.status(404).json({
        success: false,
        message: 'UI string not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: string
    });
  } catch (error) {
    console.error('Error getting UI string by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get UI string',
      error: error.message
    });
  }
};

/**
 * Create a new UI string
 */
exports.createUiString = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const { section, slug, en, th, zhCN, ru } = req.body;
    
    // Check if slug already exists
    // const existingString = await uiStringService.getUiStringBySlug(slug);
    // if (existingString) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Slug already exists'
    //   });
    // }
    
    const newString = await uiStringService.createUiString({
      section,
      slug,
      en,
      th,
      zhCN: zhCN || '',
      ru: ru || ''
    });
    
    return res.status(201).json({
      success: true,
      message: 'UI string created successfully',
      data: newString
    });
  } catch (error) {
    console.error('Error creating UI string:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create UI string',
      error: error.message
    });
  }
};

/**
 * Update a UI string
 */
exports.updateUiString = async (req, res) => {
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
    const { section, slug, en, th, zhCN, ru } = req.body;
    
    // Check if string exists
    const existingString = await uiStringService.getUiStringById(parseInt(id));
    if (!existingString) {
      return res.status(404).json({
        success: false,
        message: 'UI string not found'
      });
    }
    
    // Check if slug already exists (if changing slug)
    // if (slug !== existingString.slug) {
    //   const slugExists = await uiStringService.getUiStringBySlug(slug);
    //   if (slugExists) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Slug already exists'
    //     });
    //   }
    // }
    
    const updatedString = await uiStringService.updateUiString(parseInt(id), {
      section,
      slug,
      en,
      th,
      zhCN: zhCN || '',
      ru: ru || ''
    });
    
    return res.status(200).json({
      success: true,
      message: 'UI string updated successfully',
      data: updatedString
    });
  } catch (error) {
    console.error('Error updating UI string:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update UI string',
      error: error.message
    });
  }
};

/**
 * Delete a UI string
 */
exports.deleteUiString = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if string exists
    const existingString = await uiStringService.getUiStringById(parseInt(id));
    if (!existingString) {
      return res.status(404).json({
        success: false,
        message: 'UI string not found'
      });
    }
    
    await uiStringService.deleteUiString(parseInt(id));
    
    return res.status(200).json({
      success: true,
      message: 'UI string deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting UI string:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete UI string',
      error: error.message
    });
  }
};
