const propertyService = require('../services/propertyService');
const { ApiError } = require('../middlewares/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Property Controller - Handles HTTP requests for properties
 */
class PropertyController {
  /**
   * Duplicate a property
   * @route POST /api/properties/:id/duplicate
   */
  async duplicateProperty(req, res, next) {
    try {
      const { id } = req.params;

      // Validate that the property exists and belongs to the user
      const property = await propertyService.getPropertyById(id);

      if (!property) {
        throw new ApiError(404, 'Property not found');
      }

      // Check ownership if not admin
      if (!req.user.isAdmin && property.userId !== req.user.id) {
        throw new ApiError(403, 'You do not have permission to duplicate this property');
      }

      // Duplicate the property
      const duplicatedProperty = await propertyService.duplicateProperty(id, req.user.id);

      res.status(201).json({
        status: 'success',
        message: 'Property duplicated successfully',
        data: duplicatedProperty
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all properties
   * @route GET /api/properties
   */
  async getAllProperties(req, res, next) {
    try {
      const properties = await propertyService.getAllProperties(req.query);
      res.status(200).json({
        status: 'success',
        ...properties,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get random properties
   * @route GET /api/properties/random
   */
  async getRandomProperties(req, res, next) {
    try {
      const properties = await propertyService.getRandomProperties(req.query.count);
      res.status(200).json({
        status: 'success',
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all property types
   * @route GET /api/properties/types
   */
  async getPropertyTypes(req, res, next) {
    try {
      const propertyTypes = await propertyService.getPropertyTypes();
      res.status(200).json({
        status: 'success',
        data: propertyTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get property types with price statistics and counts
   * @route GET /api/properties/price-types
   */
  async getPropertyPriceTypes(req, res, next) {
    try {
      const propertyPriceTypes = await propertyService.getPropertyPriceTypes();
      res.status(200).json({
        status: 'success',
        data: propertyPriceTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get property by ID
   * @route GET /api/properties/:id
   */
  async getPropertyById(req, res, next) {
    try {

      const property = await propertyService.getPropertyById(req.params.id);


      res.status(200).json({
        status: 'success',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * Get property by ID for Admin (bypasses some checks)
   * @route GET /api/properties/backoffice/:id
   */
  async getPropertyByIdForAdmin(req, res, next) {
    try {
      const property = await propertyService.getPropertyByIdForAdmin(req.params.id);
      res.status(200).json({
        status: 'success',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Increment view count for a property
   * @route POST /api/properties/:id/view
   */
  async incrementViewCount(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get client IP address
      const clientIP = req.ip || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                      req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      'unknown';

      // Increment view count with IP tracking
      const result = await propertyService.incrementViewCount(id, clientIP);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          propertyId: id,
          viewCount: result.viewCount,
          counted: result.counted
        }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create new property
   * @route POST /api/properties
   */
  async createProperty(req, res, next) {
    try {
      // Validate request
      const userId = req.user.userId;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      const parseJsonField = (field) => {
        if (!field) return undefined;
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (error) {
            return field;
          }
        }
        return field;
      };

      const propertyType = req.body.propertyType;
      delete req.body.propertyType;
      const propertyData = {
        ...req.body,
        // Convert numeric fields
        userId: userId,
        listings: JSON.parse(req.body.listings),
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms, 10) : undefined,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms, 10) : undefined,
        floors: req.body.floors ? parseInt(req.body.floors, 10) : undefined,
        area: req.body.area ? parseFloat(req.body.area) : undefined,
        landSizeSqm: req.body.landSizeSqm ? parseFloat(req.body.landSizeSqm) : undefined,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        promotionalPrice: req.body.promotionalPrice ? parseFloat(req.body.promotionalPrice) : undefined,
        rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : undefined,
        shortTerm3Months: req.body.shortTerm3Months ? parseFloat(req.body.shortTerm3Months) : undefined,
        shortTerm6Months: req.body.shortTerm6Months ? parseFloat(req.body.shortTerm6Months) : undefined,
        shortTerm1Year: req.body.shortTerm1Year ? parseFloat(req.body.shortTerm1Year) : undefined,
        zone_id: req.body.zone_id ? parseInt(req.body.zone_id, 10) : undefined,
        // Parse JSON strings for various fields
        features: parseJsonField(req.body.features),
        highlights: parseJsonField(req.body.highlights),
        nearby: parseJsonField(req.body.nearby),
        views: parseJsonField(req.body.views),
        facilities: parseJsonField(req.body.facilities),
        amenities: parseJsonField(req.body.amenities),
        property_type_id: Number(propertyType),

        labels: parseJsonField(req.body.labels),
        unitPlans: parseJsonField(req.body.unitPlans),
        floorPlans: parseJsonField(req.body.floorPlans),
        contactInfo: parseJsonField(req.body.contactInfo),
        socialMedia: parseJsonField(req.body.socialMedia),

        // Parse translations
        translatedTitles: parseJsonField(req.body.translatedTitles),
        translatedDescriptions: parseJsonField(req.body.translatedDescriptions),
        translatedPaymentPlans: parseJsonField(req.body.translatedPaymentPlans),

        // Convert boolean fields
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      };
      const property = await propertyService.createProperty(propertyData, req.user.id);
      res.status(201).json({
        status: 'success',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update property
   * @route PUT /api/properties/:id
   */
  async updateProperty(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      // Define a local function for parsing JSON
      const parseJsonField = (field) => {
        if (!field) return undefined;
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (error) {
            return field;
          }
        }
        return field;
      };

      // Process form data similar to create
      const propertyData = {
        ...req.body,
        // Convert numeric fields
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms, 10) : undefined,
        listings: JSON.parse(req.body.listings),
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms, 10) : undefined,
        floors: req.body.floors ? parseInt(req.body.floors, 10) : undefined,
        area: req.body.area ? parseFloat(req.body.area) : undefined,
        landSizeSqm: req.body.landSizeSqm ? parseFloat(req.body.landSizeSqm) : undefined,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        promotionalPrice: req.body.promotionalPrice ? parseFloat(req.body.promotionalPrice) : undefined,
        rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : undefined,
        shortTerm3Months: req.body.shortTerm3Months ? parseFloat(req.body.shortTerm3Months) : undefined,
        shortTerm6Months: req.body.shortTerm6Months ? parseFloat(req.body.shortTerm6Months) : undefined,
        shortTerm1Year: req.body.shortTerm1Year ? parseFloat(req.body.shortTerm1Year) : undefined,
        replaceImages: req.body.replaceImages,
        newImages: req.body.newImages,
        existingImageMetadata: req.body.existingImageMetadata,
        property_type_id: Number(req.body.propertyType),


        // Parse JSON strings for various fields using the helper method
        features: parseJsonField(req.body.features),
        highlights: parseJsonField(req.body.highlights),
        nearby: parseJsonField(req.body.nearby),
        views: parseJsonField(req.body.views),
        facilities: parseJsonField(req.body.facilities),
        amenities: parseJsonField(req.body.amenities),
        labels: parseJsonField(req.body.labels),
        unitPlans: parseJsonField(req.body.unitPlans),
        floorPlans: parseJsonField(req.body.floorPlans),
        contactInfo: parseJsonField(req.body.contactInfo),
        socialMedia: parseJsonField(req.body.socialMedia),

        // Parse translations
        translatedTitles: parseJsonField(req.body.translatedTitles),
        translatedDescriptions: parseJsonField(req.body.translatedDescriptions),
        translatedPaymentPlans: parseJsonField(req.body.translatedPaymentPlans),

        // Convert boolean fields
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      };

      // Process images, floor plans และ unit plans
      // =======================================

      // 1. IMAGES: Process existing and new images
      if (req.files && req.files.images && req.files.images.length > 0) {
        // Handle new image uploads
        const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        // Process image metadata from formdata
        const imageMetadata = {};
        Object.keys(req.body).forEach(key => {
          if (key.includes('imageMetadata')) {
            const matches = key.match(/imageMetadata\[([^\]]+)\]\[([^\]]+)\]/);
            console.log(`Processing key: ${key}, matches:`, matches);
            if (matches && matches.length === 3) {
              const [, tempId, field] = matches;
              imageMetadata[tempId] = imageMetadata[tempId] || {};
              imageMetadata[tempId][field] = req.body[key];
            }
          }
        });


        // Add new images with their metadata
        propertyData.newImages = imageFiles.map((file, index) => {
          // Try multiple ways to find the tempId
          let tempId = null;

          // Method 1: Extract from fieldname if available
          if (file.fieldname.includes('[') && file.fieldname.includes(']')) {
            tempId = file.fieldname.split('[').pop().split(']')[0];
          }

          if (!tempId) {
            tempId = file.md5 || file.filename || `temp_${index}`;
          }

          const metadata = imageMetadata[tempId] || {};

          console.log(`Processing file: ${file.filename}, tempId: ${tempId}, metadata:`, metadata);

          return {
            url: `/images/properties/${req.params.id}/${file.filename}`,
            isFeatured: metadata.isFeatured === 'true',
            sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : index
          };
        });
      }

      // 2. Handle existing image metadata updates
      console.log("All keys in req.body:", Object.keys(req.body));
      const existingImageMetadata = {};
      Object.keys(req.body).forEach(key => {
        if (key.includes('existingImageMetadata')) {
          const matches = key.match(/existingImageMetadata\[([^\]]+)\]\[([^\]]+)\]/);
          if (matches && matches.length === 3) {
            const [, imageId, field] = matches;
            existingImageMetadata[imageId] = existingImageMetadata[imageId] || {};
            existingImageMetadata[imageId][field] = req.body[key];
          }
        }
      });

      console.log('Existing image metadata:', JSON.stringify(existingImageMetadata, null, 2));

      if (Object.keys(existingImageMetadata).length > 0) {
        propertyData.existingImageMetadata = {};

        Object.keys(existingImageMetadata).forEach(imageId => {
          const metadata = existingImageMetadata[imageId];
          propertyData.existingImageMetadata[imageId] = {
            isFeatured: metadata.isFeatured === 'true',
            sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : 0
          };
        });
      }

      // 3. Handle replacing vs keeping existing images
      if (req.body.replaceImages === 'true') {
        const existingImageIds = req.body['existingImages'];

        if (existingImageIds) {
          // มีการระบุรูปที่ต้องการเก็บไว้
          propertyData.replaceImages = true;
          propertyData.existingImages = Array.isArray(existingImageIds)
            ? existingImageIds.map(id => Number(id))
            : [Number(existingImageIds)];
        } else if (req.files && req.files.images && req.files.images.length > 0) {
          // ไม่มีการระบุรูปที่ต้องการเก็บไว้ แต่มีการอัพโหลดใหม่ (ลบรูปเก่า)
          propertyData.replaceImages = true;
          propertyData.existingImages = [];
        }
        // ไม่มีทั้งรูปเก่าที่ต้องการเก็บไว้และรูปใหม่ = ไม่ต้องทำอะไรกับรูปเก่า (ไม่ต้อง set replaceImages = true)
      }

      if (req.files) {
        // Check both possible field names (floorPlanImages and floorPlans)
        const floorPlanFiles = [];

        if (req.files.floorPlanImages && req.files.floorPlanImages.length > 0) {
          const files = Array.isArray(req.files.floorPlanImages) ? req.files.floorPlanImages : [req.files.floorPlanImages];
          floorPlanFiles.push(...files);
        }
        if (req.files.floorPlans && req.files.floorPlans.length > 0) {
          const files = Array.isArray(req.files.floorPlans) ? req.files.floorPlans : [req.files.floorPlans];
          floorPlanFiles.push(...files);
        }

        if (floorPlanFiles.length > 0) {
          console.log(`Found ${floorPlanFiles.length} floor plan files`);

          const floorPlanMetadata = {};

          // Extract from imageMetadata
          Object.keys(req.body).forEach(key => {
            if (key.includes('floorPlanMetadata')) {
              const matches = key.match(/floorPlanMetadata\[([^\]]+)\]\[([^\]]+)\]/);
              if (matches && matches.length === 3) {
                const [, tempId, field] = matches;
                floorPlanMetadata[tempId] = floorPlanMetadata[tempId] || {};
                floorPlanMetadata[tempId][field] = req.body[key];
              }
            }
          });

          propertyData.newFloorPlans = floorPlanFiles.map((file, index) => {
            // Try multiple ways to find the tempId
            let tempId = null;

            // Method 1: Extract from fieldname if available
            if (file.fieldname.includes('[') && file.fieldname.includes(']')) {
              tempId = file.fieldname.split('[').pop().split(']')[0];
            }

            // Method 2: Use file properties
            if (!tempId) {
              tempId = file.md5 || file.filename || file.originalname || `temp_${index}`;
            }

            const metadata = floorPlanMetadata[tempId] || {};

            console.log(`Processing floor plan: ${file.filename}, tempId: ${tempId}, metadata:`, metadata);

            return {
              url: `/images/properties/${req.params.id}/floor-plans/${file.filename}`,
              title: metadata.title || file.originalname || null,
              description: metadata.description || null,
              sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : index
            };
          });
        }
      }

      // 5. Handle replacing vs keeping existing floor plans
      if (req.body.replaceFloorPlans === 'true') {
        const existingFloorPlanIds = req.body['existingFloorPlans'];

        // Process metadata for existing floor plans
        const existingFloorPlanMetadata = {};
        Object.keys(req.body).forEach(key => {
          if (key.includes('existingFloorPlanMetadata')) {
            const matches = key.match(/existingFloorPlanMetadata\[([^\]]+)\]\[([^\]]+)\]/);
            if (matches && matches.length === 3) {
              const [, planId, field] = matches;

              // Check if this ID is in the existingFloorPlans array
              if (existingFloorPlanIds) {
                const idsArray = Array.isArray(existingFloorPlanIds)
                  ? existingFloorPlanIds
                  : [existingFloorPlanIds];

                if (idsArray.includes(planId)) {
                  existingFloorPlanMetadata[planId] = existingFloorPlanMetadata[planId] || {};
                  existingFloorPlanMetadata[planId][field] = req.body[key];
                }
              }
            }
          }
        });

        if (Object.keys(existingFloorPlanMetadata).length > 0) {
          propertyData.existingFloorPlanMetadata = {};

          Object.keys(existingFloorPlanMetadata).forEach(planId => {
            const metadata = existingFloorPlanMetadata[planId];
            propertyData.existingFloorPlanMetadata[planId] = {
              title: metadata.title || null,
              description: metadata.description || null,
              sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : 0
            };
          });
        }


        if (existingFloorPlanIds) {
          // มีการระบุ floor plans ที่ต้องการเก็บไว้
          propertyData.replaceFloorPlans = true;

          // แปลงให้เป็น array เสมอ
          propertyData.existingFloorPlanIds = Array.isArray(existingFloorPlanIds)
            ? existingFloorPlanIds
            : [existingFloorPlanIds];
        } else {
          // ไม่มีการระบุ existingFloorPlans จะลบทั้งหมด
          propertyData.replaceFloorPlans = true;
          propertyData.existingFloorPlanIds = [];
        }
      }

      // 6. UNIT PLANS: Process similar to floor plans
      if (req.files) {
        // Check for unit plan files
        const unitPlanFiles = [];

        if (req.files.unitPlanImages && req.files.unitPlanImages.length > 0) {
          const files = Array.isArray(req.files.unitPlanImages) ? req.files.unitPlanImages : [req.files.unitPlanImages];
          unitPlanFiles.push(...files);
        }

        if (req.files.unitPlans && req.files.unitPlans.length > 0) {
          const files = Array.isArray(req.files.unitPlans) ? req.files.unitPlans : [req.files.unitPlans];
          unitPlanFiles.push(...files);
        }

        if (unitPlanFiles.length > 0) {
          console.log(`Found ${unitPlanFiles.length} unit plan files`);

          // Process unit plan metadata using the same imageMetadata as regular images
          const unitPlanMetadata = {};
          // Extract from imageMetadata
          Object.keys(req.body).forEach(key => {
            if (key.includes('unitPlanMetadata')) {
              const matches = key.match(/unitPlanMetadata\[([^\]]+)\]\[([^\]]+)\]/);
              if (matches && matches.length === 3) {
                const [, tempId, field] = matches;
                unitPlanMetadata[tempId] = unitPlanMetadata[tempId] || {};
                unitPlanMetadata[tempId][field] = req.body[key];
              }
            }
          });


          propertyData.newUnitPlans = unitPlanFiles.map((file, index) => {
            // Try multiple ways to find the tempId
            let tempId = null;

            // Method 1: Extract from fieldname if available
            if (file.fieldname.includes('[') && file.fieldname.includes(']')) {
              tempId = file.fieldname.split('[').pop().split(']')[0];
            }

            // Method 2: Use file properties
            if (!tempId) {
              tempId = file.md5 || file.filename || file.originalname || `temp_${index}`;
            }

            const metadata = unitPlanMetadata[tempId] || {};

            return {
              url: `/images/properties/${req.params.id}/unit-plans/${file.filename}`,
              title: metadata.title || file.originalname || null,
              description: metadata.description || null,
              sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : index
            };
          });
        }
      }

      // 7. Handle replacing vs keeping existing unit plans
      if (req.body.replaceUnitPlans === 'true') {
        const existingUnitPlanIds = req.body['existingUnitPlans'];

        // Process metadata for existing unit plans
        const existingUnitPlanMetadata = {};
        Object.keys(req.body).forEach(key => {
          if (key.includes('existingUnitPlanMetadata')) {
            const matches = key.match(/existingUnitPlanMetadata\[([^\]]+)\]\[([^\]]+)\]/);
            if (matches && matches.length === 3) {
              const [, planId, field] = matches;

              // Check if this ID is in the existingUnitPlans array
              if (existingUnitPlanIds) {
                const idsArray = Array.isArray(existingUnitPlanIds)
                  ? existingUnitPlanIds
                  : [existingUnitPlanIds];

                if (idsArray.includes(planId)) {
                  existingUnitPlanMetadata[planId] = existingUnitPlanMetadata[planId] || {};
                  existingUnitPlanMetadata[planId][field] = req.body[key];
                }
              }
            }
          }
        });

        console.log('Existing unit plan metadata:', JSON.stringify(existingUnitPlanMetadata));

        if (Object.keys(existingUnitPlanMetadata).length > 0) {
          propertyData.existingUnitPlanMetadata = {};

          Object.keys(existingUnitPlanMetadata).forEach(planId => {
            const metadata = existingUnitPlanMetadata[planId];
            propertyData.existingUnitPlanMetadata[planId] = {
              title: metadata.title || null,
              description: metadata.description || null,
              sortOrder: metadata.sortOrder ? parseInt(metadata.sortOrder, 10) : 0
            };
          });
        }

        if (existingUnitPlanIds) {
          // มีการระบุ unit plans ที่ต้องการเก็บไว้
          propertyData.replaceUnitPlans = true;

          // แปลงให้เป็น array เสมอ
          propertyData.existingUnitPlanIds = Array.isArray(existingUnitPlanIds)
            ? existingUnitPlanIds
            : [existingUnitPlanIds];
        } else {
          // ไม่มีการระบุ existingUnitPlans จะลบทั้งหมด
          propertyData.replaceUnitPlans = true;
          propertyData.existingUnitPlanIds = [];
        }
      }

      const property = await propertyService.updateProperty(
        req.params.id,
        propertyData,
        req.user.id
      );

      res.status(200).json({
        status: 'success',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete property
   * @route DELETE /api/properties/:id
   */
  async deleteProperty(req, res, next) {
    try {
      await propertyService.deleteProperty(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Property deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add property image
   * @route POST /api/properties/:id/images
   */
  async addPropertyImage(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      const image = await propertyService.addPropertyImage(
        req.params.id,
        req.body,
        req.user.id
      );

      res.status(201).json({
        status: 'success',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete property image
   * @route DELETE /api/properties/images/:id
   */
  async deletePropertyImage(req, res, next) {
    try {
      await propertyService.deletePropertyImage(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get properties for the authenticated user with pagination, search, and sorting
   * @route GET /api/properties/my-properties
   */
  async getUserProperties(req, res, next) {
    try {
      const result = await propertyService.getUserProperties(req.user, req.query);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add property feature
   * @route POST /api/properties/:id/features
   */
  async addPropertyFeature(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', true, null, errors.array());
      }

      const feature = await propertyService.addPropertyFeature(
        req.params.id,
        req.body,
        req.user.id
      );

      res.status(201).json({
        status: 'success',
        data: feature,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete property feature
   * @route DELETE /api/properties/features/:id
   */
  async deletePropertyFeature(req, res, next) {
    try {
      await propertyService.deletePropertyFeature(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Feature deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the next property code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getNextPropertyCode(req, res) {
    try {
      const nextCode = await propertyService.generateNextPropertyCode();
      res.status(200).json({ success: true, propertyCode: nextCode });
    } catch (error) {
      console.error('Error getting next property code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get next property code',
        error: error.message
      });
    }
  }

  /**
   * Update property status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async updatePropertyStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status value
      const validStatuses = ['ACTIVE', 'INACTIVE'];
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Invalid status. Must be ACTIVE or INACTIVE');
      }

      // Check if property exists and user has permission
      const property = await propertyService.getPropertyByIdForAdmin(id);
      if (!property) {
        throw new ApiError(404, 'Property not found');
      }


      // Update only the status field
      const updatedProperty = await propertyService.updatePropertyStatus(id, status);

      res.status(200).json({
        status: 'success',
        message: 'Property status updated successfully',
        data: {
          id: updatedProperty.id,
          status: updatedProperty.status,
          updatedAt: updatedProperty.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duplicate a property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async duplicateProperty(req, res, next) {
    try {
      const duplicatedProperty = await propertyService.duplicateProperty(req.params.id, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Property duplicated successfully',
        data: duplicatedProperty,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
