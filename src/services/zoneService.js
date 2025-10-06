const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Zone Service - Handles business logic for zones
 */
class ZoneService {
  /**
   * Get all zones
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} - List of zones
   */
  async getAllZones(filters = {}) {
    try {
      const { city, province, search, sort = 'name', order = 'asc' } = filters;
      
      // Build filter conditions
      const where = {};
      
      if (city) {
        where.city = city;
      }
      
      if (province) {
        where.province = province;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { nameEn: { contains: search } },
          { nameTh: { contains: search } },
          { description: { contains: search } }
        ];
      }
      
      // Get zones with filters
      const zones = await prisma.zone.findMany({
        where,
        orderBy: {
          [sort]: order.toLowerCase()
        }
      });

      const datazone =[]
      for (const zone of zones) {
        // Format image path
        if (zone.z_image) {
          zone.imagePath = process.env.NEXT_PUBLIC_IMAGE_URL + zone.z_image;
        } else {
          zone.imagePath = null; // Handle case where image is not set
        }

        // Format names
        zone.name = zone.name || '';
        zone.name_en = zone.nameEn || '';
        zone.name_th = zone.nameTh || '';
        zone.name_ch = zone.nameCh || '';
        zone.name_ru = zone.nameRu || '';


        datazone.push(zone)
      }

      console.log("datazone",datazone);

      // Sort zones by name

      return datazone;
    } catch (error) {
      console.error('Error in getAllZones service:', error);
      throw error;
    }
  }
  
  /**
   * Get zone by ID
   * @param {number} id - Zone ID
   * @returns {Promise<Object>} - Zone object
   */
  async getZoneById(id) {
    try {
      const zone = await prisma.zone.findUnique({
        where: { id: Number(id) }
      });
      
      if (!zone) {
        throw new Error('Zone not found');
      }
      
      return zone;
    } catch (error) {
      console.error('Error in getZoneById service:', error);
      throw error;
    }
  }
  
  /**
   * Get properties by zone ID
   * @param {number} zoneId - Zone ID
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} - Properties in the zone
   */
  async getPropertiesByZone(zoneId, filters = {}) {
    try {
      const { 
        page = 1, 
        limit = 10,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms
      } = filters;
      
      const skip = (page - 1) * Number(limit);
      
      // Build filter conditions
      const where = {
        zoneId: Number(zoneId)
      };
      
      if (propertyType) {
        where.propertyType = propertyType;
      }
      
      if (minPrice || maxPrice) {
        where.propertyListings = {
          some: {
            price: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) })
            }
          }
        };
      }
      
      if (bedrooms) {
        where.bedrooms = Number(bedrooms);
      }
      
      if (bathrooms) {
        where.bathrooms = Number(bathrooms);
      }

      where.deletedAt = null;

      where.isPublished = true;
      
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
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          },
          zone: true,
          labels:{
            include:{
              Icon:true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return {
        data: properties,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      };
    } catch (error) {
      console.error('Error in getPropertiesByZone service:', error);
      throw error;
    }
  }
  
  /**
   * Get cities with zones
   * @returns {Promise<Array>} - List of cities with their zones
   */
  async getCitiesWithZones() {
    try {
      // Get all zones grouped by city
      const zones = await prisma.zone.findMany({
        orderBy: [
          { city: 'asc' },
          { name: 'asc' }
        ]
      });
      
      // Group zones by city
      const citiesWithZones = zones.reduce((acc, zone) => {
        if (!acc[zone.city]) {
          acc[zone.city] = {
            city: zone.city,
            province: zone.province,
            zones: []
          };
        }
        
        acc[zone.city].zones.push(zone);
        return acc;
      }, {});
      
      return Object.values(citiesWithZones);
    } catch (error) {
      console.error('Error in getCitiesWithZones service:', error);
      throw error;
    }
  }
  
  /**
   * Get random zones with property counts
   * @param {number} limit - Number of random zones to return
   * @returns {Promise<Array>} - List of random zones with property counts
   */
  async getRandomZonesWithPropertyCounts(limit=20) {
    try {
      // Get all zones first
      const allZones = await prisma.zone.findMany({
        select: {
          id: true,
          nameEn: true,
          nameTh: true,
          nameCh: true,
          nameRu: true,
          description: true,
          city: true,
          province: true,
          z_image: true,
          _count: {
            select: {
              properties: true
            }
          }
        }
      });
      
      // Filter out zones with no properties
      const zonesWithProperties = allZones.filter(zone => zone._count.properties > 0);
      
      // Calculate total properties count
      const totalPropertiesCount = zonesWithProperties.reduce((sum, zone) => sum + zone._count.properties, 0);
      console.log(`Total properties in the system: ${totalPropertiesCount}`);
      
      // Format the response
      const formattedZones = zonesWithProperties.map(zone => ({
        id: zone.id,
        name: zone.name,
        name_en: zone.nameEn,
        name_th: zone.nameTh,
        name_ch: zone.nameCh,
        name_ru: zone.nameRu,
        description: zone.description,
        city: zone.city,
        province: zone.province,
        imagePath: process.env.NEXT_PUBLIC_IMAGE_URL + zone.z_image,
        propertyCount: zone._count.properties
      }));

      return formattedZones;
    } catch (error) {
      console.error('Error in getRandomZonesWithPropertyCounts service:', error);
      throw error;
    }
  }
}

module.exports = new ZoneService();
