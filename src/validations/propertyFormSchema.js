const { body } = require('express-validator');

/**
 * Validation schema for property form
 */
const propertyFormValidation = [
  // Basic property info
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string'),
  
  body('projectName')
    .notEmpty().withMessage('Project name is required')
    .isString().withMessage('Project name must be a string'),
  
  body('propertyType').notEmpty().withMessage('Property type is required'),
  
  // Address info
  body('address')
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),
  
  body('district')
    .notEmpty().withMessage('District is required')
    .isString().withMessage('District must be a string'),
  
  body('subdistrict')
    .notEmpty().withMessage('Subdistrict is required')
    .isString().withMessage('Subdistrict must be a string'),
  
  body('province')
    .notEmpty().withMessage('Province is required')
    .isString().withMessage('Province must be a string'),
  
  // body('city')
  //   .notEmpty().withMessage('City is required')
  //   .isString().withMessage('City must be a string'),
  
  body('zipCode')
    .notEmpty().withMessage('Zip code is required')
    .isString().withMessage('Zip code must be a string'),
  
  body('latitude')
    .optional()
    .isFloat().withMessage('Latitude must be a number'),
  
  body('longitude')
    .optional()
    .isFloat().withMessage('Longitude must be a number'),
  
  // Area info
  body('area')
    .notEmpty().withMessage('Area is required')
    .isString().withMessage('Area must be a positive String'),
  
  body('usableArea')
    .optional()
    .isFloat({ min: 0 }).withMessage('Usable area must be a positive number'),
  
  // Land info
  body('land_size_rai')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Land size (rai) must be a positive number'),
  
  body('land_size_ngan')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Land size (ngan) must be a positive number'),
  
  body('land_size_sq_wah')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Land size (sq. wah) must be a positive number'),
  
  body('landWidth')
    .optional()
    .isFloat({ min: 0 }).withMessage('Land width must be a positive number'),
  
  body('landLength')
    .optional()
    .isFloat({ min: 0 }).withMessage('Land length must be a positive number'),
  
  body('landShape')
    .optional()
    .isIn(['RECTANGLE', 'SQUARE', 'TRIANGLE', 'IRREGULAR', 'L_SHAPE'])
    .withMessage('Invalid land shape'),
  
  body('landGrade')
    .optional()
    .isIn(['FILLED', 'PARTIALLY_FILLED', 'UNFILLED', 'SLOPED'])
    .withMessage('Invalid land grade'),
  
  body('landAccess')
    .optional()
    .isIn(['PUBLIC_ROAD', 'PRIVATE_ROAD', 'ALLEY', 'NO_ACCESS'])
    .withMessage('Invalid land access'),
  
  body('ownershipType')
    .optional()
    .isIn(['FREEHOLD', 'LEASEHOLD'])
    .withMessage('Invalid ownership type'),
  
  // Building info
  body('bedrooms')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  
  body('bathrooms')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  
  body('floors')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Floors must be a non-negative integer'),
  
  body('furnishing')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Invalid furnishing type'),
  
  body('constructionYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1900, max: 2100 })
    .withMessage(`Construction year must be between 1900 and 2100`),
  
  body('communityFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Community fee must be a positive number'),
  
  // Description
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string'),
  
  // Optional fields
  body('translatedTitles')
    .optional(),
  
  body('translatedDescriptions')
    .optional(),
  
  body('paymentPlan')
    .optional()
    .isString().withMessage('Payment plan must be a string'),
  
  body('translatedPaymentPlans')
    .optional(),
  
  body('socialMedia')
    .optional(),
  
  body('contactInfo')
    .optional(),
  
  // Arrays
  body('features')
    .optional(),
  
  body('amenities')
    .optional(),
  
  body('facilities')
    .optional(),
  
  body('views')
    .optional(),
  
  body('highlights')
    .optional(),
  
  body('labels')
    .optional(),
  
  body('nearby')
    .optional(),
];

module.exports = propertyFormValidation;
