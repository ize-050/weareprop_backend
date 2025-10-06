const propertyRepository = require('../repositories/propertyRepository');
const { ApiError } = require('../middlewares/errorHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Property Service - Business logic for properties
 */
class PropertyService {
  /**
   * Duplicate a property with all its related data
   * @param {string} propertyId - ID of the property to duplicate
   * @param {string} userId - ID of the user duplicating the property
   * @returns {Promise<Object>} - The duplicated property
   */
  async duplicateProperty(propertyId, userId) {
    try {
      // Start a transaction to ensure all operations succeed or fail together
      return await prisma.$transaction(async (prismaClient) => {
        // 1. Get the original property with all related data
        const originalProperty = await prismaClient.property.findUnique({
          where: { id: propertyId },
          include: {
            listings: true,
            images: true,
            features: true,
            amenities: true,
            locations: true
          }
        });

        if (!originalProperty) {
          throw new ApiError(404, 'Property not found');
        }

        // 2. Generate a new reference number
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newReference = `DP-${year}${month}${day}-${randomDigits}`;

        // 3. Create a new property record (excluding the id and reference)
        const { id, reference, createdAt, updatedAt, ...propertyData } = originalProperty;
        
        // Create the new property with the new reference
        const newProperty = await prismaClient.property.create({
          data: {
            ...propertyData,
            reference: newReference,
            projectName: `${originalProperty.projectName}`,
            userId: userId,
            status: 'publish', // Start as draft
            viewCount: 0,    // Reset counts
            inquiryCount: 0,
            landSizeSqm: originalProperty.landSizeSqm
          }
        });

        // 4. Duplicate listings
        if (originalProperty.listings && originalProperty.listings.length > 0) {
          for (const listing of originalProperty.listings) {
            const { id, propertyId, createdAt, updatedAt, ...listingData } = listing;
            await prismaClient.listing.create({
              data: {
                ...listingData,
                propertyId: newProperty.id
              }
            });
          }
        }

        // 5. Duplicate images
        if (originalProperty.images && originalProperty.images.length > 0) {
          for (const image of originalProperty.images) {
            const { id, propertyId, createdAt, updatedAt, ...imageData } = image;
            await prismaClient.image.create({
              data: {
                ...imageData,
                propertyId: newProperty.id
              }
            });
          }
        }

        // 6. Duplicate features
        if (originalProperty.features && originalProperty.features.length > 0) {
          for (const feature of originalProperty.features) {
            const { id, propertyId, createdAt, updatedAt, ...featureData } = feature;
            await prismaClient.feature.create({
              data: {
                ...featureData,
                propertyId: newProperty.id
              }
            });
          }
        }

        // 7. Duplicate amenities
        if (originalProperty.amenities && originalProperty.amenities.length > 0) {
          for (const amenity of originalProperty.amenities) {
            const { id, propertyId, createdAt, updatedAt, ...amenityData } = amenity;
            await prismaClient.amenity.create({
              data: {
                ...amenityData,
                propertyId: newProperty.id
              }
            });
          }
        }

        // 8. Duplicate locations
        if (originalProperty.locations && originalProperty.locations.length > 0) {
          for (const location of originalProperty.locations) {
            const { id, propertyId, createdAt, updatedAt, ...locationData } = location;
            await prismaClient.location.create({
              data: {
                ...locationData,
                propertyId: newProperty.id
              }
            });
          }
        }

        // Return the newly created property with all its relations
        return await prismaClient.property.findUnique({
          where: { id: newProperty.id },
          include: {
            listings: true,
            images: true,
            features: true,
            amenities: true,
            locations: true
          }
        });
      });
    } catch (error) {
      console.error('Error duplicating property:', error);
      throw new ApiError(500, 'Failed to duplicate property', false, error.stack);
    }
  }

  /**
   * Get all properties with pagination and filtering
   */
  async getAllProperties(queryParams) {
    try {
      return await propertyRepository.findAll(queryParams);
    } catch (error) {
      throw new ApiError(500, 'Error fetching properties', false, error.stack);
    }
  }

  /**
 * Get random properties
 * @param {number} count - Number of properties to return
 * @returns {Promise<Array>} - Random properties
 */
  async getRandomProperties(count = 4) {
    try {
      const properties = await propertyRepository.getRandomProperties(count);

      const propertiesWithFullImageUrls = properties.map(property => {
        const propertyWithFullUrls = { ...property };
        const propertyId = property.id;

        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
          const sortedImages = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder);
          
          propertyWithFullUrls.images = sortedImages.map((image, index) => {
            const imageWithFullUrl = { ...image };
            
            if (image.url && image.url.startsWith('/')) {
              imageWithFullUrl.url = `${process.env.NEXT_PUBLIC_IMAGE_URL}${image.url}`;
            } else {
              const filename = `property-img-0${index + 1}.png`;
              const newUrl = `/images/properties/${propertyId}/${filename}`;
              imageWithFullUrl.url = `${process.env.NEXT_PUBLIC_IMAGE_URL}${newUrl}`;
            }

            return imageWithFullUrl;
          });
          
          const featuredImage = propertyWithFullUrls.images.find(img => img.isFeatured) || propertyWithFullUrls.images[0];
          propertyWithFullUrls.featuredImage = featuredImage;
          
        } else {
          const defaultImages = [
            {
              id: 0,
              url: `${process.env.NEXT_PUBLIC_IMAGE_URL}/images/properties/${propertyId}/property-img-01.png`,
              isFeatured: true,
              sortOrder: 0
            },
            {
              id: 1,
              url: `${process.env.NEXT_PUBLIC_IMAGE_URL}/images/properties/property-img-0${propertyId}.png`,
              isFeatured: false,
              sortOrder: 1
            }
          ];
          
          propertyWithFullUrls.images = defaultImages;
          propertyWithFullUrls.featuredImage = defaultImages[0];
        }

        return propertyWithFullUrls;
      });

      return propertiesWithFullImageUrls;
    } catch (error) {
      throw new ApiError(500, 'Error fetching random properties', false, error.stack);
    }
  }


  /**
   * Get property by ID
   */
  /**
   * Get property by ID for Admin (bypasses some checks)
   */
  async getPropertyByIdForAdmin(id) {
    try {
      const property = await propertyRepository.findByIdForAdmin(id);

      if (!property) {
        throw new ApiError(404, `Property with ID ${id} not found`);
      }
      return property;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching property for admin', false, error.stack);
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id) {
    try {
      const properties = await propertyRepository.findById(id);

      if (!properties) {
        throw new ApiError(404, `Property with ID ${id} not found`);
      }
      return properties;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching property', false, error.stack);
    }
  }

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    try {
      // Generate property code if needed
      if (!propertyData.propertyCode) {
        propertyData.propertyCode = await this.generateNextPropertyCode();
      }

      // Create property
      const newProperty = await propertyRepository.create(propertyData);
      
      

      return newProperty;
    } catch (error) {
      throw new ApiError(500, 'Error creating property', false, error.stack);
    }
  }

  /**
   * Create a duplicate property from existing property data
   * This function is similar to createProperty but specifically for duplicating properties
   * @param {Object} propertyData - Property data to duplicate
   * @param {string} userId - ID of the user creating the duplicate
   * @returns {Promise<Object>} - The newly created duplicate property
   */
  async createDuplicateProperty(propertyData, userId) {
    try {
      // Generate a new property code
      propertyData.propertyCode = await this.generateNextPropertyCode();
      
      // Set the user ID for the new property
      propertyData.userId = userId;
      
      // Set status to publish for the duplicate property
      propertyData.status = 'publish';
      
      // Reset counts for the new property
      propertyData.viewCount = 0;
      propertyData.inquiryCount = 0;
      
      // Create the duplicate property
      const newProperty = await propertyRepository.create(propertyData);
      
      return newProperty;
    } catch (error) {
      throw new ApiError(500, 'Error creating duplicate property', false, error.stack);
    }
  }


  /**
   * Update property
   */
  async updateProperty(id, propertyData, userId) {
    try {
      // Check if property exists and belongs to user
      const property = await propertyRepository.findById(id);

      if (!property) {
        throw new ApiError(404, `Property with ID ${id} not found`);
      }



      return await propertyRepository.update(id, propertyData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating property', false, error.stack);
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id, userId) {
    try {
      // Check if property exists and belongs to user
      const property = await propertyRepository.findById(id);

      if (!property) {
        throw new ApiError(404, `Property with ID ${id} not found`);
      }


      return await propertyRepository.softDelete(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting property', false, error.stack);
    }
  }

  /**
   * Add property image
   */
  async addPropertyImage(propertyId, imageData, userId) {
    try {
      // Check if property exists and belongs to user
      const property = await propertyRepository.findById(propertyId);

      if (!property) {
        throw new ApiError(404, `Property with ID ${propertyId} not found`);
      }

      // Check if user is owner or admin
      if (property.userId !== userId) {
        throw new ApiError(403, 'Not authorized to add images to this property');
      }

      return await propertyRepository.addImage(propertyId, imageData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error adding property image', false, error.stack);
    }
  }

  /**
   * Delete property image
   */
  async deletePropertyImage(imageId, userId) {
    try {
      // Find the image
      const image = await prisma.propertyImage.findUnique({
        where: { id: Number(imageId) },
        include: { property: true },
      });

      if (!image) {
        throw new ApiError(404, `Image with ID ${imageId} not found`);
      }

      // Check if user is owner or admin
      if (image.property.userId !== userId) {
        throw new ApiError(403, 'Not authorized to delete this image');
      }

      return await propertyRepository.deleteImage(imageId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting property image', false, error.stack);
    }
  }

  /**
   * Add property feature
   */
  async addPropertyFeature(propertyId, featureData, userId) {
    try {
      // Check if property exists and belongs to user
      const property = await propertyRepository.findById(propertyId);

      if (!property) {
        throw new ApiError(404, `Property with ID ${propertyId} not found`);
      }

      // Check if user is owner or admin
      if (property.userId !== userId) {
        throw new ApiError(403, 'Not authorized to add features to this property');
      }

      return await propertyRepository.addFeature(propertyId, featureData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error adding property feature', false, error.stack);
    }
  }

  /**
   * Delete property feature
   */
  async deletePropertyFeature(featureId, userId) {
    try {
      // Find the feature
      const feature = await prisma.propertyFeature.findUnique({
        where: { id: Number(featureId) },
        include: { property: true },
      });

      if (!feature) {
        throw new ApiError(404, `Feature with ID ${featureId} not found`);
      }

      // Check if user is owner or admin
      if (feature.property.userId !== userId) {
        throw new ApiError(403, 'Not authorized to delete this feature');
      }

      return await propertyRepository.deleteFeature(featureId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting property feature', false, error.stack);
    }
  }

  /**
   * Get property types with price statistics and counts
   * @returns {Promise<Array>} - Property types with counts and images
   */
  async getPropertyPriceTypes() {
    try {
      // ดึงข้อมูลประเภทอสังหาริมทรัพย์จากตาราง TypeProperty
      const propertyTypes = await prisma.typeProperty.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      
      // ดึงข้อมูลจำนวนอสังหาริมทรัพย์ในแต่ละประเภท
      const propertyCounts = await prisma.property.groupBy({
        by: ['propertyTypeId'],
        _count: {
          id: true
        },
        where:{
          deletedAt:null
        }
      });
      
      const countMap = {};
      propertyCounts.forEach(item => {
        countMap[item.propertyTypeId] = item._count.id;
      });

      console.log("propertyCounts",propertyCounts);

      let enrichedPropertyTypes = propertyTypes.map(type => ({
        ...type,
        count: countMap[type.id] || 0,
        image: process.env.NEXT_PUBLIC_IMAGE_URL + type.p_image
      }));


      enrichedPropertyTypes = enrichedPropertyTypes.filter(item => item.count > 0);
      
      return enrichedPropertyTypes;
    } catch (error) {
      throw new ApiError(500, 'Error fetching property price types', false, error.stack);
    }
  }

  /**
   * Get image URL for property type
   * @param {string} type - Property type
   * @returns {string} - Image URL for property type
   */
  getPropertyTypeImage(type) {
    const baseUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/images/property-types/`;
    const imageMapping = {
      CONDO: `${baseUrl}condo.jpg`,
      HOUSE: `${baseUrl}house.jpg`,
      TOWNHOUSE: `${baseUrl}townhouse.jpg`,
      VILLA: `${baseUrl}villa.jpg`,
      LAND: `${baseUrl}land.jpg`,
      APARTMENT: `${baseUrl}apartment.jpg`,
      COMMERCIAL: `${baseUrl}commercial.jpg`,
      OFFICE: `${baseUrl}office.jpg`,
      RETAIL: `${baseUrl}retail.jpg`,
      WAREHOUSE: `${baseUrl}warehouse.jpg`,
      FACTORY: `${baseUrl}factory.jpg`,
      HOTEL: `${baseUrl}hotel.jpg`,
      RESORT: `${baseUrl}resort.jpg`
    };
    
    return imageMapping[type] || `${baseUrl}default.jpg`;
  }

  /**
   * Get all property types
   * @returns {Promise<Array>} - All property types
   */
  async getPropertyTypes() {
    try {
      // ดึงข้อมูลจากตาราง TypeProperty ในฐานข้อมูล
      const propertyTypes = await prisma.typeProperty.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      
      return propertyTypes;
    } catch (error) {
      console.error('Error fetching property types:', error);
      throw error;
    }
  }
  
  /**
   * Get Thai name for property type
   * @param {string} type - Property type in English
   * @returns {string} - Thai name for property type
   */
  getPropertyTypeNameTh(type) {
    const nameMapping = {
      CONDO: 'คอนโดมิเนียม',
      HOUSE: 'บ้านเดี่ยว',
      TOWNHOUSE: 'ทาวน์เฮาส์',
      VILLA: 'วิลล่า',
      LAND: 'ที่ดิน',
      APARTMENT: 'อพาร์ทเมนท์',
      COMMERCIAL: 'อาคารพาณิชย์',
      OFFICE: 'สำนักงาน',
      RETAIL: 'ร้านค้า',
      WAREHOUSE: 'คลังสินค้า',
      FACTORY: 'โรงงาน',
      HOTEL: 'โรงแรม',
      RESORT: 'รีสอร์ท'
    };
    
    return nameMapping[type] || type;
  }
  
  /**
   * Get description for property type
   * @param {string} type - Property type
   * @returns {string} - Description for property type
   */
  getPropertyTypeDescription(type) {
    const descriptionMapping = {
      CONDO: 'ห้องชุดในอาคารที่พักอาศัยรวม มีพื้นที่ส่วนกลางและสิ่งอำนวยความสะดวกร่วมกัน',
      HOUSE: 'บ้านเดี่ยวที่ตั้งอยู่บนที่ดินแยกเป็นสัดส่วน มีรั้วรอบขอบชิด',
      TOWNHOUSE: 'บ้านที่มีผนังติดกับบ้านข้างเคียง ตั้งอยู่บนพื้นที่แคบยาว',
      VILLA: 'บ้านพักตากอากาศหรือบ้านหรูที่มีการออกแบบพิเศษ',
      LAND: 'ที่ดินเปล่าสำหรับการพัฒนาหรือลงทุน',
      APARTMENT: 'อาคารที่พักอาศัยให้เช่า มักมีเจ้าของเป็นบุคคลเดียว',
      COMMERCIAL: 'อาคารสำหรับการพาณิชย์ มักมีพื้นที่ค้าขายด้านล่างและที่พักอาศัยด้านบน',
      OFFICE: 'พื้นที่สำหรับสำนักงานหรือการทำธุรกิจ',
      RETAIL: 'พื้นที่สำหรับร้านค้าปลีกหรือการบริการ',
      WAREHOUSE: 'อาคารสำหรับเก็บสินค้าหรือวัตถุดิบ',
      FACTORY: 'โรงงานสำหรับการผลิตสินค้า',
      HOTEL: 'สถานที่พักแรมสำหรับนักท่องเที่ยวหรือผู้มาเยือน',
      RESORT: 'ที่พักตากอากาศที่มีสิ่งอำนวยความสะดวกครบครัน'
    };
    
    return descriptionMapping[type] || '';
  }
  /**
   * Get properties for a specific user with pagination, search, and sorting
   * @param {number} userId - User ID
   * @param {Object} queryParams - Query parameters for pagination, search, and sorting
   * @returns {Promise<Object>} - Properties with pagination metadata
   */
  async getUserProperties(user, queryParams) {
    try {
      if (!user || !user.userId) {
        throw new ApiError(400, 'User information is required');
      }


      let properties;
      if (user.role === 'ADMIN') {
        properties = await propertyRepository.findAll(queryParams);
      } else {
        properties = await propertyRepository.findByUserId(user.userId, queryParams);
      }

      return properties;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching user properties', false, error.stack);
    }
  }

  /**
   * Generate the next property code
   * Format: DP000001, DP000002, etc.
   * @returns {Promise<string>} The next property code
   */
  async generateNextPropertyCode() {
    try {
      // Get the latest property sorted by propertyCode in descending order
      const latestProperty = await propertyRepository.findLatestPropertyCode();
      
      // If no properties exist, start from DP000001
      if (!latestProperty) {
        return 'DP00001';
      }
      
      // Extract the number part and increment
      const codePrefix = 'DP';
      const currentCode = latestProperty.propertyCode || '';
      let numericPart = 1;
      
      if (currentCode.startsWith(codePrefix)) {
        const numericString = currentCode.substring(codePrefix.length);
        numericPart = parseInt(numericString, 10) + 1;
      }
      
      // Format the new code with leading zeros (6 digits)
      const paddedNumber = numericPart.toString().padStart(5, '0');
      return `${codePrefix}${paddedNumber}`;
    } catch (error) {
      console.error('Error generating next property code:', error);
      throw error;
    }
  }

  /**
   * Update property status only
   * @param {string} propertyId - ID of the property to update
   * @param {string} status - New status value (ACTIVE or INACTIVE)
   * @returns {Promise<Object>} - The updated property
   */
  async updatePropertyStatus(propertyId, status) {
    try {
      let statusBoolean = false;
      if (status === 'ACTIVE') {
        statusBoolean = true;
      }
      else {
        statusBoolean = false;
      }
      return await prisma.property.update({
        where: { id: parseInt(propertyId) },
        data: {
          isPublished: statusBoolean,
          updatedAt: new Date()
        },
        select: {
          id: true,
          status: true,
          updatedAt: true
        }
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a property with IP-based deduplication
   * @param {string} propertyId - ID of the property
   * @param {string} clientIP - Client IP address
   * @returns {Promise<Object>} - Result with view count and whether it was counted
   */
  async incrementViewCount(propertyId, clientIP) {
    try {
      const propertyIdInt = parseInt(propertyId);
      
      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyIdInt },
        select: { id: true, viewCount: true }
      });
      
      if (!property) {
        throw new ApiError(404, 'Property not found');
      }

      // Create a simple in-memory cache for IP tracking (expires after 1 hour)
      // In production, you might want to use Redis or database table for this
      if (!this.viewCache) {
        this.viewCache = new Map();
      }
      
      const cacheKey = `${propertyId}_${clientIP}`;
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Check if this IP has viewed this property recently
      const lastView = this.viewCache.get(cacheKey);
      
      if (lastView && (now - lastView) < oneHour) {
        // Don't count this view, but return current count
        return {
          message: 'View already counted from this IP recently',
          viewCount: property.viewCount,
          counted: false
        };
      }
      
      // Clean up expired cache entries (simple cleanup)
      if (this.viewCache.size > 1000) {
        const expiredKeys = [];
        for (const [key, timestamp] of this.viewCache.entries()) {
          if (now - timestamp > oneHour) {
            expiredKeys.push(key);
          }
        }
        expiredKeys.forEach(key => this.viewCache.delete(key));
      }
      
      // Update view count and cache
      const updatedProperty = await prisma.property.update({
        where: { id: propertyIdInt },
        data: {
          viewCount: {
            increment: 1
          },
          updatedAt: new Date()
        },
        select: {
          id: true,
          viewCount: true
        }
      });
      
      // Cache this view
      this.viewCache.set(cacheKey, now);
      
      return {
        message: 'View count incremented successfully',
        viewCount: updatedProperty.viewCount,
        counted: true
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error incrementing view count:', error);
      throw new ApiError(500, 'Error updating view count', false, error.stack);
    }
  }

  // Increment interested count for property when enquiry is submitted
  async incrementInterestedCount(propertyId) {
    try {
      const propertyIdInt = parseInt(propertyId);
      
      // ตรวจสอบว่า property มีอยู่จริง
      const property = await prisma.property.findUnique({
        where: { id: propertyIdInt },
        select: { id: true, interestedCount: true }
      });
      
      if (!property) {
        throw new ApiError(404, 'Property not found');
      }
      
      // อัปเดต interestedCount แบบ atomic
      const updatedProperty = await prisma.property.update({
        where: { id: propertyIdInt },
        data: {
          interestedCount: { increment: 1 },
          updatedAt: new Date()
        },
        select: { id: true, interestedCount: true }
      });
      
      return {
        message: 'Interested count incremented successfully',
        propertyId: propertyIdInt,
        interestedCount: updatedProperty.interestedCount
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error incrementing interested count:', error);
      throw new ApiError(500, 'Error updating interested count', false, error.stack);
    }
  }

  // Cache cleanup function
  cleanupViewCache() {
    if (!this.viewCache) return;
    
    const now = Date.now();
    const oneHour = 3600000; // 1 hour in milliseconds
    
    for (const [key, timestamp] of this.viewCache.entries()) {
      if (now - timestamp > oneHour) {
        this.viewCache.delete(key);
      }
    }
  }
}

module.exports = new PropertyService();
