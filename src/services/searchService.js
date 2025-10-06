const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Search Service - Handles business logic for property searching
 */
class SearchService {
  /**
   * Search properties with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} - Properties matching the filters with pagination
   */
  async searchProperties(filters = {}) {
    try {
      const { 
        page = 1, 
        limit = 10,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        zoneId,
        city,
        province,
        search,
        sort = 'createdAt',
        order = 'desc',
        type,
      } = filters;
      
      const skip = (page - 1) * Number(limit);
      
      // Build filter conditions
      const where = {
        deletedAt: null, // กรองเฉพาะรายการที่ยังไม่ถูก soft delete
        isPublished: true, // กรองเฉพาะรายการที่ publish แล้ว
      };
      
      // Property type filter
      if (propertyType) {
        where.propertyType = {
          name: propertyType
        };

      }

      // Location filters
      if (zoneId) {
        where.zoneId = Number(zoneId);
      }
      
      if (city) {
        where.city = city;
      }
      
      if (province) {
        where.province = province;
      }
      
      // Bedrooms filter
      if (bedrooms) {
        where.bedrooms = Number(bedrooms);
      }
      
      // Bathrooms filter
      if (bathrooms) {
        where.bathrooms = Number(bathrooms);
      }
      
      // Search text
      if (search) {
        where.OR = [
          { projectName: { contains: search } },
          { address: { contains: search } },
          { searchAddress: { contains: search } },
          { district: { contains: search } },
          { city: { contains: search } },
          { province: { contains: search } }
        ];
      }
      
      // Build listing filters (type and price)
      const listingConditions = {};
      
      if (type) {
        listingConditions.listingType = type.toUpperCase();
      }
      
      if (minPrice || maxPrice) {
        listingConditions.price = {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) })
        };
      }
      
      // Apply listing filters if any conditions exist
      if (Object.keys(listingConditions).length > 0) {
        where.listings = {
          some: listingConditions
        };
      }
      
      // Get total count
      const total = await prisma.property.count({ where });
      
      // Get properties
      const properties = await prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: [
              { isFeatured: 'desc' },
              { sortOrder: 'asc' }
            ]
          },
          listings: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          highlights: true,
          amenities: true,
          views: true,
          zone: true,
          propertyType:true,
          labels:{
            where:{
              active:true
            },
            include:{
              Icon:true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          [sort]: order.toLowerCase()
        }
      });
      
      // Process images to include full URLs
      const processedProperties = properties.map(property => {
        // Process images
        const processedImages = property.images.map(image => {
          // If image URL already starts with http, return as is
          if (image.url.startsWith('http')) {
            return image;
          }
          
          // Otherwise, construct the full URL
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          return {
            ...image,
            url: `${baseUrl}${image.url}`
          };
        });
        
        // Sort images by sortOrder and isFeatured
        const sortedImages = [...processedImages].sort((a, b) => {
          // First sort by isFeatured (featured images first)
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          
          // Then sort by sortOrder
          return a.sortOrder - b.sortOrder;
        });
        
        return {
          ...property,
          zone: property.zone ? {
            ...property.zone,
            name_th : property.zone.nameTh,
            name_en : property.zone.nameEn || property.zone.name,
            name_ch : property.zone.nameCh || property.zone.name,
            name_ru : property.zone.nameRu || property.zone.name,
          } : null,
          propertyType:property.propertyType ? {
            ...property.propertyType,
            name_th : property.propertyType.nameTh,
            name_en : property.propertyType.nameEn || property.propertyType.name,
            name_ch : property.propertyType.nameCh || property.propertyType.name,
            name_ru : property.propertyType.nameRu || property.propertyType.name,
          } : null,
          propertyLabel:property.propertyLabel,
          images: sortedImages
        };
      });
      
      return {
        data: processedProperties,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      };
    } catch (error) {
      console.error('Error in searchProperties service:', error);
      throw error;
    }
  }
}

module.exports = new SearchService();
