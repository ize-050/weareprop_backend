const { Prisma, PrismaClient } = require('@prisma/client');
const path = require("path");
const fs = require("fs");
const prisma = new PrismaClient();



/**
 * Property Repository - Handles database operations for properties
 */
class PropertyRepository {

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Find all properties with pagination and filtering
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      propertyType, // ยังคงรับ propertyType จาก options แต่จะใช้เป็น property_type_id
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      zoneId,
      search,
      userId,
      // status = 'ACTIVE',
    } = options;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      deletedAt: null, // กรองเฉพาะรายการที่ยังไม่ถูก soft delete
      listings: {
      },
    }

    // Add search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } }
      ];
    }

    // Filter by user ID if provided
    if (userId) {
      where.userId = Number(userId);
    }

    if (propertyType) where.propertyTypeId = Number(propertyType);
    if (listingType) where.listingType = listingType;
    if (city) where.city = city;
    if (bedrooms) where.bedrooms = Number(bedrooms);
    if (bathrooms) where.bathrooms = Number(bathrooms);

    // Price range
    if (minPrice || maxPrice) {
      where.listings = {
        some: {}
      };
      if (minPrice) where.listings.some.price = { ...where.listings.some.price, gte: Number(minPrice) };
      if (maxPrice) where.listings.some.price = { ...where.listings.some.price, lte: Number(maxPrice) };
    }

    if (zoneId) where.zoneId = Number(zoneId);

    where.deletedAt = null;

    
    // Execute query
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            where: { isFeatured: true },
            take: 1,
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listings: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: Number(limit),
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: properties,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Find property by ID
   */
  async findById(id) {
    const property = await prisma.property.findFirst({
      where: { 
        id: Number(id),
        isPublished: true, // Only fetch published properties
        deletedAt: null // กรองเฉพาะรายการที่ยังไม่ถูก soft delete
      },
      include: {
        images: true,
        features:true,
        listings: true,
        zone: true, // เพิ่ม zone data
        highlights:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        facilities:{
          where: {
            active: true,
          },
          include: {
            Icon: true
          },
        },
        amenities:{
           where: {
            active: true
          },
          include: {
            Icon: true
          }
        },
        views:{
          where: {
            active: true
          },
          include: {
                Icon: true
            }
        },
        nearbyPlaces:{
          where: {
            active: true
          },
          include: {
                Icon: true
            }
        },
        labels:{
            where: {
                active: true
            },
          include:{
              Icon:true
          }
        },
        unitPlans: true,
        floorPlans: true,
        user:true,
        propertyType: true,
      },
    });

    if (!property) return null;

    // Parse JSON string fields back to objects
    try {
      if (property.translatedTitles && typeof property.translatedTitles === 'string') {
        property.translatedTitles = JSON.parse(property.translatedTitles);
      }
      if (property.translatedDescriptions && typeof property.translatedDescriptions === 'string') {
        property.translatedDescriptions = JSON.parse(property.translatedDescriptions);
      }
      if (property.translatedPaymentPlans && typeof property.translatedPaymentPlans === 'string') {
        property.translatedPaymentPlans = JSON.parse(property.translatedPaymentPlans);
      }
      if (property.socialMedia && typeof property.socialMedia === 'string') {
        property.socialMedia = JSON.parse(property.socialMedia);
      }
      if (property.contactInfo && typeof property.contactInfo === 'string') {
        property.contactInfo = JSON.parse(property.contactInfo);
      }
    } catch (error) {
      console.error('Error parsing JSON fields in findById:', error);
      // Set to empty objects if parsing fails
      property.translatedTitles = property.translatedTitles || {};
      property.translatedDescriptions = property.translatedDescriptions || {};
      property.translatedPaymentPlans = property.translatedPaymentPlans || {};
      property.socialMedia = property.socialMedia || {};
      property.contactInfo = property.contactInfo || {};
    }

    // Transform Icon properties from camelCase to snake_case for multi-language support
    const transformIconProperties = (items) => {
      if (!items || !Array.isArray(items)) return items;
      return items.map(item => {
        if (item.Icon) {
          item.Icon = {
            ...item.Icon,
            name_th: item.Icon.nameTh,
            name_ch: item.Icon.nameCh,
            name_ru: item.Icon.nameRu
          };
        }
        return item;
      });
    };

    // Apply transformation to all icon-related arrays
    if (property.highlights) property.highlights = transformIconProperties(property.highlights);
    if (property.facilities) property.facilities = transformIconProperties(property.facilities);
    if (property.amenities) property.amenities = transformIconProperties(property.amenities);
    if (property.views) property.views = transformIconProperties(property.views);
    if (property.nearbyPlaces) property.nearbyPlaces = transformIconProperties(property.nearbyPlaces);
    if (property.labels) property.labels = transformIconProperties(property.labels);

    // Ensure Co-Agent fields are included in response
    property.coAgentAccept = property.coAgentAccept || false;
    property.commissionType = property.commissionType || null;
    property.commissionPercent = property.commissionPercent || null;
    property.commissionAmount = property.commissionAmount || null;
    property.privateNote = property.privateNote || null;

   
    return property;
  }

  /**
   * Find property by ID for admin/owner access (without isPublished filter)
   */
  async findByIdForAdmin(id) {
    const property = await prisma.property.findFirst({
      where: { 
        id: Number(id),
        deletedAt: null // กรองเฉพาะรายการที่ยังไม่ถูก soft delete
      },
      include: {
        images: true,
        features:true,
        listings: true,
        highlights:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        facilities:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        amenities:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        views:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        nearbyPlaces:{
          where: {
            active: true
          },
          include:{
            Icon: true
          }
        },
        labels:{
          include:{
            Icon:true
          }
        },
        unitPlans: true,
        floorPlans: true,
        user:true,
      },
    });

    if (!property) {
      return null;
    }

    // Transform Icon properties from camelCase to snake_case for multi-language support
    const transformIconProperties = (items) => {
      if (!items || !Array.isArray(items)) return items;
      return items.map(item => {
        if (item.Icon) {
          item.Icon = {
            ...item.Icon,
            name_th: item.Icon.nameTh,
            name_ch: item.Icon.nameCh,
            name_ru: item.Icon.nameRu
          };
        }
        return item;
      });
    };

    // Apply transformation to all icon-related arrays
    if (property.highlights) property.highlights = transformIconProperties(property.highlights);
    if (property.facilities) property.facilities = transformIconProperties(property.facilities);
    if (property.amenities) property.amenities = transformIconProperties(property.amenities);
    if (property.views) property.views = transformIconProperties(property.views);
    if (property.nearbyPlaces) property.nearbyPlaces = transformIconProperties(property.nearbyPlaces);
    if (property.labels) property.labels = transformIconProperties(property.labels);

    // Ensure Co-Agent fields are included in response
    property.coAgentAccept = property.coAgentAccept || false;
    property.commissionType = property.commissionType || null;
    property.commissionPercent = property.commissionPercent || null;
    property.commissionAmount = property.commissionAmount || null;
    property.privateNote = property.privateNote || null;

    return property;
  }

  /**
   * Create new property with transaction support
   * @param {Object} data - Property data from frontend
   * @returns {Promise} - Created property
   */
  async create(data) {
    try {

      // Return the transaction result
      return prisma.$transaction(async (tx) => {

        let amenitiesData = [];
        if (data.amenities) {
          // Parse amenities data from string if needed
          const amenities = typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities;
            amenitiesData =  Object.keys(amenities).map(key => ({
              amenityType: key,
              active: amenities[key].active === true || amenities[key].active === 'true' ? true : false,
              iconId: amenities[key].iconId || null
            }));

        }

        let facilitiesData = [];
        if (data.facilities) {
          // Parse facilities data from string if needed
          const facilities = typeof data.facilities === 'string' ? JSON.parse(data.facilities) : data.facilities;

          // Facilities มีโครงสร้างซ้อนกัน เป็น facilities[category][key]
          // ต้องวนลูปผ่านแต่ละ category ก่อน แล้วจึงวนลูปผ่าน key ในแต่ละ category
          Object.keys(facilities).forEach(category => {
            Object.keys(facilities[category]).forEach(key => {
              facilitiesData.push({
                facilityType: key,
                active: facilities[category][key].active === true || facilities[category][key].active === 'true',
                iconId: facilities[category][key].iconId || null
              });
            });
          });
          
          console.log("facilitiesData processed:", facilitiesData);
        }

        // Parse views, highlights, nearby places and labels data
        let viewsData = [];
        if (data.views) {
          const views = typeof data.views === 'string' ? JSON.parse(data.views) : data.views;
          viewsData =  Object.keys(views).map(key => ({
            viewType: key,
            active: views[key].active === true || views[key].active === 'true' ? true : false,
            iconId: views[key].iconId || null
          }));
        }
        
        let highlightsData = [];
        if (data.highlights) {
          const highlights = typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights;
          
          // Check if it's an array format with defined structure from frontend
            highlightsData =  Object.keys(highlights).map(key => ({
              highlightType: key,
              active: highlights[key].active === true || highlights[key].active === 'true' ? true : false,
              iconId: highlights[key].iconId || null
            }));

          }



        let nearbyPlacesData = [];
        if (data.nearby) {
          const nearby = typeof data.nearby === 'string' ? JSON.parse(data.nearby) : data.nearby;
          
          // Check if it's an array format with defined structure from frontend

            nearbyPlacesData = Object.keys(nearby).map(key => ({
              nearbyType: key,
              active: nearby[key].active === true || nearby[key].active === 'true' || nearby[key].active === true ,
              iconId: nearby[key].iconId || null
            }));

        }

        let labelsData = [];
        if (data.labels) {
          const labels = typeof data.labels === 'string' ? JSON.parse(data.labels) : data.labels;
          labelsData = Object.keys(labels).map(key => ({
            labelType: key,
            active: labels[key].active === true || labels[key].active === 'true',
            iconId: labels[key].iconId || null
          }));
          
          console.log("labelsData processed:", labelsData);
        }
        // Prepare property base data
        const propertyData = {
          title: data.propertyTitle || data.title,
          projectName: data.projectName,
          propertyCode: data.propertyCode || data.propertyId,
          referenceId: data.referenceId,
          propertyTypeId: Number(data.property_type_id),
          address: data.address,
          searchAddress: data.searchAddress,
          district: data.district,
          subdistrict: data.subdistrict,
          province: data.province,
          city: data.city,
          country: data.country || 'Thailand',
          zipCode: data.postalCode || data.zipCode,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,

          // Zone relation
          zoneId: data.zone_id ? parseInt(data.zone_id) : undefined,
       
          
          // Area info
          area: 10,
          usableArea: data.usableArea ? parseFloat(data.usableArea) : null,
          
          // Land info
          landSizeRai: data.land_size_rai ? parseFloat(data.land_size_rai) : null,
          landSizeNgan: data.land_size_ngan ? parseFloat(data.land_size_ngan) : null,
          landSizeSqWah: data.land_size_sq_wah ? parseFloat(data.land_size_sq_wah) : null,
          landSizeSqm: data.landSizeSqm ? parseFloat(data.landSizeSqm) : null,
          landWidth: data.landWidth ? parseFloat(data.landWidth) : null,
          landLength: data.landLength ? parseFloat(data.landLength) : null,
          landShape: data.landShape,
          landGrade: data.landGrade,
          landAccess: data.landAccess,
          ownershipType: data.ownershipType,
          ownershipQuota: data.ownershipQuota,
          
          // Building info
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
          bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
          floors: data.floors ? parseInt(data.floors) : null,
          furnishing: data.furnishing,
          constructionYear: data.constructionYear ? parseInt(data.constructionYear) : null,
          communityFee: data.communityFees ? parseFloat(data.communityFees) : (data.communityFee ? parseFloat(data.communityFee) : null),
          buildingUnit: data.buildingUnit,
          floor: data.floor ? parseInt(data.floor) : null,
          
          // Multilingual content
          description: data.description,
          translatedTitles: data.translatedTitles ? JSON.stringify(data.translatedTitles) : null,
          translatedDescriptions: data.translatedDescriptions ? JSON.stringify(data.translatedDescriptions) : null,
          paymentPlan: data.paymentPlan,
          translatedPaymentPlans: data.translatedPaymentPlans ? JSON.stringify(data.translatedPaymentPlans) : null,
          
          // Contact and social media
          socialMedia: data.socialMedia ? JSON.stringify(data.socialMedia) : null,
          contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,
          
          // Co-Agent Accept fields
          coAgentAccept: data.coAgentAccept === true || data.coAgentAccept === 'true' || data.coAgentAccept === '1',
          commissionType: data.commissionType || null,
          commissionPercent: data.commissionPercent || null,
          commissionAmount: data.commissionAmount || null,
          privateNote: data.privateNote || null,
          
          // Status and metadata
          status: data.status || 'ACTIVE',
          isFeatured: data.isFeatured === true || data.isFeatured === 'true',

          // User relation
          userId:  data.userId ? parseInt(data.userId) : 1,
          zoneId: data.zone_id ? parseInt(data.zone_id) : undefined,
        };
        const property = await tx.property.create({
          data: {
            ...propertyData,
            listings:{
                create: data.listings.map(listing => ({
                    ...listing,
                  price : listing.price ? parseFloat(listing.price) : 0,
                  userId:  data.userId ? parseInt(data.userId) : 1,
                  promotionalPrice:listing.promotionalPrice ? parseFloat(listing.promotionalPrice) : null,
                  status: 'ACTIVE',
                  shortTerm3Months : listing.shortTerm3Months ? parseFloat(listing.shortTerm3Months) : null,
                  shortTerm6Months : listing.shortTerm6Months ? parseFloat(listing.shortTerm6Months) : null,
                  shortTerm1Year : listing.shortTerm1Year ? parseFloat(listing.shortTerm1Year) : null,

                }))
            },
            amenities: amenitiesData.length > 0 ? {
              create: amenitiesData,
            } : undefined,
            facilities: facilitiesData.length > 0 ? {
              create: facilitiesData,
            } : undefined,
            views: viewsData.length > 0 ? {
              create: viewsData,
            } : undefined,
            highlights: highlightsData.length > 0 ? {
              create: highlightsData,
            } : undefined,
            labels: labelsData.length > 0 ? {
              create: labelsData,
            } : undefined,
            nearbyPlaces: nearbyPlacesData.length > 0 ? {
              create: nearbyPlacesData,
            } : undefined,
          },
          include: {
            features: true,
            amenities: true,
            facilities: true,
            views: true,
            highlights: true,
            labels: true,
            zone: true,
            user: true,
            nearbyPlaces: true,
          },
        });

      //  Move images to the property folder with the correct property ID
        if (data.images && data.images.length > 0) {
          console.log(" data.images", data.images)
          await this.moveImagesFromTemp(property.id, data.images);

          // Now create image records with updated URLs
          const imagesData = data.images.map((image, index) => {
            // Update image URL to point to the correct property folder
            const updatedUrl = image.url.replace('/properties/temp/', `/properties/${property.id}/`);

            return {
              url: updatedUrl,
              isFeatured: image.isFeatured || index === 0,
              sortOrder: image.sortOrder !== undefined ? Number(image.sortOrder) : index,
              propertyId: property.id
            };
          });

          // Create all image records
          if (imagesData.length > 0) {
            await tx.propertyImage.createMany({
              data: imagesData
            });
          }
        }

        // Move floor plan images to the property folder with the correct property ID
        if (data.floorPlans && data.floorPlans.length > 0) {
          await this.moveFloorPlanImagesFromTemp(property.id, data.floorPlans);

          // Now create floor plan records with updated URLs
          const floorPlansData = data.floorPlans.map((plan, index) => {
            // Update plan URL to point to the correct property folder
            const updatedUrl = plan.url.replace('/properties/temp/', `/properties/${property.id}/`);

            return {
              url: updatedUrl,
              title: plan.title,
              description: plan.description,
              sortOrder: plan.sortOrder !== undefined ? Number(plan.sortOrder) : index,
              propertyId: property.id
            };
          });

          // Create all floor plan records
          if (floorPlansData.length > 0) {
            await tx.floorPlan.createMany({
              data: floorPlansData
            });
          }
        }

        // Move unit plan images to the property folder with the correct property ID
        if (data.unitPlans && data.unitPlans.length > 0) {
          await this.moveUnitPlanImagesFromTemp(property.id, data.unitPlans);

          // Now create unit plan records with updated URLs
          const unitPlansData = data.unitPlans.map((plan, index) => {
            // Update plan URL to point to the correct property folder
            const updatedUrl = plan.url.replace('/properties/temp/', `/properties/${property.id}/`);

            return {
              url: updatedUrl,
              propertyId: property.id,
              sortOrder: plan.sortOrder !== undefined ? Number(plan.sortOrder) : index,
            };
          });

          // Create all unit plan records
          if (unitPlansData.length > 0) {
            await tx.unitPlan.createMany({
              data: unitPlansData
            });
          }
        }

        const completeProperty = await tx.property.findUnique({
          where: { id: property.id },
          include: {
            features: true,
            amenities: true,
            facilities: true,
            views: true,
            highlights: true,
            labels: true,
            unitPlans: true,
          }
        });
        return completeProperty;
      });
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update property
   */
  async update(id, data) {
    // ข้อมูลฐานสำหรับการอัพเดทพร็อพเพอร์ตี้
    const propertyData = {
      // Basic property info
      title: data.propertyTitle || data.title,
      projectName: data.projectName,
      propertyCode: data.propertyCode || data.propertyId,
      referenceId: data.referenceId,
      propertyTypeId:  data.property_type_id,

      // Address info
      address: data.address,
      searchAddress: data.searchAddress,
      district: data.district,
      subdistrict: data.subdistrict,
      province: data.province,
      city: data.city,
      country: data.country || 'Thailand',
      zipCode: data.postalCode || data.zipCode,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,

      // Zone relation
      zoneId: data.zone_id ? parseInt(data.zone_id) : undefined,

      // Area info
      area: 10, // Fixed value per your recent edit
      usableArea: data.usableArea ? parseFloat(data.usableArea) : null,

      // Land info
      landSizeRai: data.land_size_rai ? parseFloat(data.land_size_rai) : null,
      landSizeNgan: data.land_size_ngan ? parseFloat(data.land_size_ngan) : null,
      landSizeSqWah: data.land_size_sq_wah ? parseFloat(data.land_size_sq_wah) : null,
      landSizeSqm: data.landSizeSqm ? parseFloat(data.landSizeSqm) : null,
      landWidth: data.landWidth ? parseFloat(data.landWidth) : null,
      landLength: data.landLength ? parseFloat(data.landLength) : null,
      landShape: data.landShape,
      landGrade: data.landGrade,
      landAccess: data.landAccess,
      ownershipType: data.ownershipType,
      ownershipQuota: data.ownershipQuota,

      // Building info
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      floors: data.floors ? parseInt(data.floors) : null,
      furnishing: data.furnishing,
      constructionYear: data.constructionYear ? parseInt(data.constructionYear) : null,
      communityFee: data.communityFees ? parseFloat(data.communityFees) : (data.communityFee ? parseFloat(data.communityFee) : null),
      buildingUnit: data.buildingUnit,
      floor: data.floor ? parseInt(data.floor) : null,

      // Multilingual content
      description: data.description,
      translatedTitles: data.translatedTitles ? JSON.stringify(data.translatedTitles) : null,
      translatedDescriptions: data.translatedDescriptions ? JSON.stringify(data.translatedDescriptions) : null,
      paymentPlan: data.paymentPlan,
      translatedPaymentPlans: data.translatedPaymentPlans ? JSON.stringify(data.translatedPaymentPlans) : null,

      // Contact and social media
      socialMedia: data.socialMedia ? JSON.stringify(data.socialMedia) : null,
      contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,

      // Co-Agent Accept fields
      coAgentAccept: data.coAgentAccept === true || data.coAgentAccept === 'true' || data.coAgentAccept === '1',
      commissionType: data.commissionType || null,
      commissionPercent: data.commissionPercent || null,
      commissionAmount: data.commissionAmount || null,
      privateNote: data.privateNote || null,

      // Status and metadata
      status: data.status || 'ACTIVE',
      isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      videoUrl: data.videoUrl,
    };

    try {

      const updatedProperty = await prisma.$transaction(async (tx) => {

        let amenitiesData = [];
        if (data.amenities) {

          // Parse amenities data from string if needed
          const amenities = typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities;
          amenitiesData =  Object.keys(amenities).map(key => ({
            amenityType: key,
            active: amenities[key].active === true || amenities[key].active === 'true' ? true : false,
            iconId: amenities[key].iconId || null
          }));

        }

        let facilitiesData = [];
        if (data.facilities) {
          // Parse facilities data from string if needed
          const facilities = typeof data.facilities === 'string' ? JSON.parse(data.facilities) : data.facilities;

          // Facilities มีโครงสร้างซ้อนกัน เป็น facilities[category][key]
          // ต้องวนลูปผ่านแต่ละ category ก่อน แล้วจึงวนลูปผ่าน key ในแต่ละ category
          Object.keys(facilities).forEach(category => {
            Object.keys(facilities[category]).forEach(key => {
              facilitiesData.push({
                facilityType: key,
                active: facilities[category][key].active === true || facilities[category][key].active === 'true',
                iconId: facilities[category][key].iconId || null
              });
            });
          });

        }

        // Parse views, highlights, nearby places and labels data
        let viewsData = [];
        if (data.views) {
          const views = typeof data.views === 'string' ? JSON.parse(data.views) : data.views;
          viewsData =  Object.keys(views).map(key => ({
            viewType: key,
            active: views[key].active === true || views[key].active === 'true' ? true : false,
            iconId: views[key].iconId || null
          }));
        }

        let highlightsData = [];
        if (data.highlights) {
          const highlights = typeof data.highlights === 'string' ? JSON.parse(data.highlights) : data.highlights;

          // Check if it's an array format with defined structure from frontend
          highlightsData =  Object.keys(highlights).map(key => ({
            highlightType: key,
            active: highlights[key].active === true || highlights[key].active === 'true' ? true : false,
            iconId: highlights[key].iconId || null
          }));

        }


        let nearbyPlacesData = [];
        if (data.nearby) {
          const nearby = typeof data.nearby === 'string' ? JSON.parse(data.nearby) : data.nearby;

          // Check if it's an array format with defined structure from frontend

          nearbyPlacesData = Object.keys(nearby).map(key => ({
            nearbyType: key,
            active: nearby[key].active === true || nearby[key].active === 'true' || nearby[key].active === true ,
            iconId: nearby[key].iconId || null
          }));

        }

        let labelsData = [];
        if (data.labels) {
          const labels = typeof data.labels === 'string' ? JSON.parse(data.labels) : data.labels;
          labelsData = Object.keys(labels).map(key => ({
            labelType: key,
            active: labels[key].active === true || labels[key].active === 'true' || labels[key].active === true ,
            iconId: labels[key].iconId || null
          }));

        }

        // ดึงข้อมูลพร็อพเพอร์ตี้ที่ต้องการอัพเดท
        const property = await tx.property.findUnique({
          where: { id: Number(id) },

        });

        if (!property) {
          throw new Error('Property not found');
        }


        // อัพเดทข้อมูลพื้นฐานของพร็อพเพอร์ตี้
        const updated = await tx.property.updateMany({
          where: { id: Number(id) },
          data: {
            ...propertyData,
          },
        });

        // Handle property listings - delete existing and create new ones
        if (data.listings && Array.isArray(data.listings) && data.listings.length > 0) {
          // Delete existing listings
          await tx.propertyListing.deleteMany({
            where: { propertyId: Number(id) }
          });
          
          // Create new listings
          await tx.propertyListing.createMany({
            data: data.listings.map(listing => ({
              ...listing,
              price: listing.price ? parseFloat(listing.price) : 0,
              userId:  data.userId ? parseInt(data.userId) : property.userId,
              promotionalPrice: listing.promotionalPrice ? parseFloat(listing.promotionalPrice) : null,
              status: listing.status || 'ACTIVE',
              shortTerm3Months: listing.shortTerm3Months ? parseFloat(listing.shortTerm3Months) : null,
              shortTerm6Months: listing.shortTerm6Months ? parseFloat(listing.shortTerm6Months) : null,
              shortTerm1Year: listing.shortTerm1Year ? parseFloat(listing.shortTerm1Year) : null,
              propertyId: Number(id),
              pricePerSqm: listing.pricePerSqm ? parseFloat(listing.pricePerSqm) : null
            }))
          });
        }

        if (amenitiesData.length > 0) {
          await tx.propertyAmenity.deleteMany({
            where: {propertyId: Number(id)}
          });

          // เพิ่ม amenities ใหม่

          await tx.propertyAmenity.createMany({
            data: amenitiesData.map(amenity => ({
              amenityType: amenity.amenityType,
              active: amenity.active,
              iconId: amenity.iconId,
              propertyId: Number(id)
            }))
          })
        }


      if(highlightsData.length > 0) {
          await tx.propertyHighlight.deleteMany({
            where: { propertyId: Number(id) }
          });

          // เพิ่ม highlights ใหม่
          await tx.propertyHighlight.createMany({
            data: highlightsData.map(highlight => ({
              highlightType: highlight.highlightType,
              active: highlight.active,
              iconId: highlight.iconId,
              propertyId: Number(id)
            }))
          })

        }

        if(nearbyPlacesData.length > 0) {
          await tx.propertyNearby.deleteMany({
            where: { propertyId: Number(id) }
          });


          await tx.propertyNearby.createMany({
            data: nearbyPlacesData.map(nearbyPlace => ({
              nearbyType: nearbyPlace.nearbyType,
              active: nearbyPlace.active,
              iconId: nearbyPlace.iconId,
              propertyId: Number(id)
            }))
          })
        }

        if(viewsData.length > 0) {
          await tx.propertyView.deleteMany({
            where: { propertyId: Number(id) }
          });

         await tx.propertyView.createMany({
            data: viewsData.map(view => ({
              viewType: view.viewType,
              active: view.active,
              iconId: view.iconId,
              propertyId: Number(id)
            }))
          })
        }


        if(facilitiesData.length > 0) {
          await tx.propertyFacility.deleteMany({
            where: { propertyId: Number(id) }
          });


         await tx.propertyFacility.createMany({
            data: facilitiesData.map(facility => ({
              facilityType: facility.facilityType,
              active: facility.active,
              iconId: facility.iconId,
              propertyId: Number(id)
            }))
          })
        }

        if(labelsData.length > 0) {
          await tx.propertyLabel.deleteMany({
            where: { propertyId: Number(id) }
          });

          // เพิ่ม labels ใหม่
          await tx.propertyLabel.createMany({
            data: labelsData.map(label => ({
              labelType: label.labelType,
              active: label.active,
              iconId: label.iconId,
              propertyId: Number(id)
            }))
          })
        }

        // จัดการรูปภาพถ้ามีการแทนที่ (replacement)
        if (data.replaceImages === true && Array.isArray(data.existingImages)) {
          try {
            // ดึงรูปภาพปัจจุบันทั้งหมด
            const existingImages = await tx.propertyImage.findMany({
              where: { propertyId: Number(id) }
            });
            
            // คำนวณรูปที่ต้องลบ (รูปทั้งหมดที่ไม่อยู่ใน existingImages)
            const imagesToDelete = existingImages
              .filter(img => !data.existingImages.includes(img.id))
              .map(img => img.id);
              
            // ลบทีละรูป
            for (const imageId of imagesToDelete) {
              try {
                // ค้นหารูปภาพที่จะลบ
                const imageToDelete = await tx.propertyImage.findUnique({
                  where: { id: Number(imageId) }
                });
                
                if (!imageToDelete) continue;
                
                // ลบไฟล์จากระบบ
                if (imageToDelete.url && process.env.DELETE_FILES === 'true') {
                  try {
                    const fs = require('fs');
                    const path = require('path');
                    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', imageToDelete.url.replace(/^\//, ''));
                    
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                    }
                  } catch (fsError) {
                    console.error(`Failed to delete image file: ${fsError.message}`);
                  }
                }
                
                // ลบข้อมูลจาก database
                await tx.propertyImage.delete({
                  where: { id: Number(imageId) }
                });
              } catch (error) {
                console.error(`Failed to delete image ${imageId}: ${error.message}`);
              }
            }
            
            // อัพเดท metadata ของรูปเก่าที่เก็บไว้
            if (data.existingImageMetadata) {
              for (const imageId of Object.keys(data.existingImageMetadata)) {
                try {
                  const metadata = data.existingImageMetadata[imageId];
                  
                  // ตรวจสอบว่า image ยังมีอยู่หรือไม่
                  const imageExists = await tx.propertyImage.findUnique({
                    where: { id: Number(imageId) }
                  });
                  
                  if (!imageExists) continue;
                  
                  console.log(`Updating image ${imageId} metadata:`, metadata);
                  
                  // อัพเดต metadata
                  await tx.propertyImage.update({
                    where: { id: Number(imageId) },
                    data: {
                      isFeatured: Boolean(metadata.isFeatured) || metadata.isFeatured,
                      sortOrder: metadata.sortOrder !== undefined ? Number(metadata.sortOrder) : imageExists.sortOrder
                    }
                  });
                  
                  console.log(`Updated metadata for image ${imageId} successfully`);
                } catch (error) {
                  console.error(`Failed to update metadata for image ${imageId}: ${error.message}`);
                }
              }
            }
          } catch (error) {
            console.error(`Error processing replacement images: ${error.message}`);
          }
        } else if (data.deleteImages && Array.isArray(data.deleteImages) && data.deleteImages.length > 0) {
          // ถ้ามีการระบุ deleteImages โดยตรง ก็ใช้โค้ดเดิม
          await Promise.all(data.deleteImages.map(async (imageId) => {
            try {
              // ค้นหารูปภาพที่จะลบ
              const imageToDelete = await tx.propertyImage.findUnique({
                where: { id: Number(imageId) }
              });
              
              if (!imageToDelete) return;
              
              // ลบไฟล์จากระบบ
              if (imageToDelete.url && process.env.DELETE_FILES === 'true') {
                try {
                  const fs = require('fs');
                  const path = require('path');
                  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', imageToDelete.url.replace(/^\//, ''));
                  
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                  }
                } catch (fsError) {
                  console.error(`Failed to delete image file: ${fsError.message}`);
                }
              }
              
              // ลบข้อมูลจาก database
              await tx.propertyImage.delete({
                where: { id: Number(imageId) }
              });
            } catch (error) {
              console.error(`Failed to delete image ${imageId}: ${error.message}`);
            }
          }));
        }
        
        // จัดการ images ใหม่
        if (data.newImages && Array.isArray(data.newImages) && data.newImages.length > 0) {
          await Promise.all(data.newImages.map(async (image, index) => {
            try {
              // ตรวจสอบว่ามีข้อมูลที่จำเป็น
              if (!image.url) return;
              
              // แปลงค่า sortOrder เป็น number
              const sortOrder = image.sortOrder !== undefined ? 
                                Number(image.sortOrder) : 
                                index;
              
              console.log(`Creating new image with sortOrder: ${sortOrder}`);
              
              // สร้าง record ใหม่
              await tx.propertyImage.create({
                data: {
                  url: image.url,
                  isFeatured: image.isFeatured || false,
                  sortOrder: sortOrder,
                  propertyId: Number(id)
                }
              });
            } catch (error) {
              console.error(`Failed to add new image: ${error.message}`);
            }
          }));
        }
        
        // จัดการ Floor Plans เช่นเดียวกับ Images
        if (data.replaceFloorPlans === true && Array.isArray(data.existingFloorPlanIds)) {
          try {
            // ดึง floor plans ปัจจุบันทั้งหมด
            const existingFloorPlans = await tx.floorPlan.findMany({
              where: { propertyId: Number(id) }
            });
            
            // คำนวณ floor plans ที่ต้องลบ
            const plansToDelete = existingFloorPlans
              .filter(plan => !data.existingFloorPlanIds.includes(plan.id.toString()));
            
            if (plansToDelete.length > 0) {
              const planIdsToDelete = plansToDelete.map(plan => plan.id);
              console.log('Deleting floor plans:', planIdsToDelete);
              
              // Delete the plans that are not in the list
              await tx.floorPlan.deleteMany({
                where: { 
                  id: { in: planIdsToDelete },
                  propertyId: Number(id)
                }
              });
            }
          } catch (error) {
            console.error(`Error processing replacement floor plans: ${error.message}`);
          }
        } else if (data.deleteFloorPlans && Array.isArray(data.deleteFloorPlans) && data.deleteFloorPlans.length > 0) {
          // ถ้ามีการระบุ deleteFloorPlans โดยตรง ก็ใช้โค้ดเดิม
          await Promise.all(data.deleteFloorPlans.map(async (planId) => {
            try {
              // ค้นหาแผนผังที่จะลบ
              const planToDelete = await tx.floorPlan.findUnique({
                where: { id: Number(planId) }
              });
              
              if (!planToDelete) return;
              
              // ลบไฟล์จากระบบ
              if (planToDelete.url && process.env.DELETE_FILES === 'true') {
                try {
                  const fs = require('fs');
                  const path = require('path');
                  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', planToDelete.url.replace(/^\//, ''));
                  
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                  }
                } catch (fsError) {
                  console.error(`Failed to delete floor plan file: ${fsError.message}`);
                }
              }
              
              // ลบข้อมูลจาก database
              await tx.floorPlan.delete({
                where: { id: Number(planId) }
              });
            } catch (error) {
              console.error(`Failed to delete floor plan ${planId}: ${error.message}`);
            }
          }));
        }
        
        // จัดการ Floor Plans ใหม่
        if (data.newFloorPlans && Array.isArray(data.newFloorPlans) && data.newFloorPlans.length > 0) {
          await Promise.all(data.newFloorPlans.map(async (plan, index) => {
            try {
              // ตรวจสอบว่ามีข้อมูลที่จำเป็น
              if (!plan.url) return;
              
              // แปลงค่า sortOrder เป็น number
              const sortOrder = plan.sortOrder !== undefined ? 
                               Number(plan.sortOrder) : 
                               index;

              // สร้าง record ใหม่
              await tx.floorPlan.create({
                data: {
                  url: plan.url,
                  title: plan.title || null,
                  sortOrder: sortOrder,
                  propertyId: Number(id)
                }
              });
            } catch (error) {
              console.error(`Failed to add new floor plan: ${error.message}`);
            }
          }));
        }
        
        // จัดการ metadata ของ floor plans ที่มีอยู่แล้ว
        if (data.existingFloorPlanMetadata && typeof data.existingFloorPlanMetadata === 'object') {
          await Promise.all(Object.keys(data.existingFloorPlanMetadata).map(async (planId) => {
            try {
              const metadata = data.existingFloorPlanMetadata[planId];
              
              // ตรวจสอบว่า floor plan ยังมีอยู่หรือไม่
              const planExists = await tx.floorPlan.findUnique({
                where: { id: Number(planId) }
              });
              
              if (!planExists) return;
              
              console.log(`Updating floor plan ${planId} metadata:`, metadata);
              
              // อัพเดต metadata
              await tx.floorPlan.update({
                where: { id: Number(planId) },
                data: {
                  title: metadata.title || planExists.title,
                  sortOrder: metadata.sortOrder !== undefined ? Number(metadata.sortOrder) : planExists.sortOrder
                }
              });
              
              console.log(`Updated metadata for floor plan ${planId} successfully`);
            } catch (error) {
              console.error(`Failed to update floor plan metadata for ${planId}: ${error.message}`);
            }
          }));
        }

        // จัดการ Unit Plans เช่นเดียวกับ Floor Plans และ Images
        if (data.replaceUnitPlans === true && Array.isArray(data.existingUnitPlanIds)) {
          try {
            // ดึง unit plans ปัจจุบันทั้งหมด
            const existingUnitPlans = await tx.unitPlan.findMany({
              where: { propertyId: Number(id) }
            });
            
            // คำนวณ unit plans ที่ต้องลบ
            const plansToDelete = existingUnitPlans
              .filter(plan => !data.existingUnitPlanIds.includes(plan.id.toString()));
            
            if (plansToDelete.length > 0) {
              const planIdsToDelete = plansToDelete.map(plan => plan.id);
              console.log('Deleting unit plans:', planIdsToDelete);
              
              // Delete the plans that are not in the list
              await tx.unitPlan.deleteMany({
                where: { 
                  id: { in: planIdsToDelete },
                  propertyId: Number(id)
                }
              });
            }
          } catch (error) {
            console.error(`Error processing replacement unit plans: ${error.message}`);
          }
        } else if (data.deleteUnitPlans && Array.isArray(data.deleteUnitPlans) && data.deleteUnitPlans.length > 0) {
          // ถ้ามีการระบุ deleteUnitPlans โดยตรง ก็ใช้โค้ดเดิม
          await Promise.all(data.deleteUnitPlans.map(async (planId) => {
            try {
              // ค้นหาแผนผังที่จะลบ
              const planToDelete = await tx.unitPlan.findUnique({
                where: { id: Number(planId) }
              });
              
              if (!planToDelete) return;
              
              // ลบไฟล์จากระบบ
              if (planToDelete.url && process.env.DELETE_FILES === 'true') {
                try {
                  const fs = require('fs');
                  const path = require('path');
                  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', planToDelete.url.replace(/^\//, ''));
                  
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                  }
                } catch (fsError) {
                  console.error(`Failed to delete unit plan file: ${fsError.message}`);
                }
              }
              
              // ลบข้อมูลจาก database
              await tx.unitPlan.delete({
                where: { id: Number(planId) }
              });
            } catch (error) {
              console.error(`Failed to delete unit plan ${planId}: ${error.message}`);
            }
          }));
        }
        
        // จัดการ Unit Plans ใหม่
        if (data.newUnitPlans && Array.isArray(data.newUnitPlans) && data.newUnitPlans.length > 0) {
          await Promise.all(data.newUnitPlans.map(async (plan, index) => {
            try {
              // ตรวจสอบว่ามีข้อมูลที่จำเป็น
              if (!plan.url) return;
              
              // แปลงค่า sortOrder เป็น number
              const sortOrder = plan.sortOrder !== undefined ? 
                               Number(plan.sortOrder) : 
                               index;
                               
              console.log(`Creating new unit plan with sortOrder: ${sortOrder}`);
              
              // สร้าง record ใหม่
              await tx.unitPlan.create({
                data: {
                  url: plan.url,
                  sortOrder: sortOrder,
                  propertyId: Number(id)
                }
              });
            } catch (error) {
              console.error(`Failed to add new unit plan: ${error.message}`);
            }
          }));
        }

        // จัดการ metadata ของ unit plans ที่มีอยู่แล้ว
        if (data.existingUnitPlanMetadata && typeof data.existingUnitPlanMetadata === 'object') {
          await Promise.all(Object.keys(data.existingUnitPlanMetadata).map(async (planId) => {
            try {
              const metadata = data.existingUnitPlanMetadata[planId];
              
              // ตรวจสอบว่า unit plan ยังมีอยู่หรือไม่
              const planExists = await tx.unitPlan.findUnique({
                where: { id: Number(planId) }
              });
              
              if (!planExists) return;
              
              console.log(`Updating unit plan ${planId} metadata:`, metadata);
              
              // อัพเดต metadata
              await tx.unitPlan.update({
                where: { id: Number(planId) },
                data: {
                  title: metadata.title || planExists.title,
                  description: metadata.description || planExists.description,
                  sortOrder: metadata.sortOrder !== undefined ? Number(metadata.sortOrder) : planExists.sortOrder
                }
              });
              
              console.log(`Updated metadata for unit plan ${planId} successfully`);
            } catch (error) {
              console.error(`Failed to update unit plan metadata for ${planId}: ${error.message}`);
            }
          }));
        }

        // อัพเดท property หลัก
        const updatedPropertyLast =   await tx.property.findUnique({
          where: { id: Number(id) },
          include: {
            images: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
        });
        return updatedPropertyLast;
      });
      
      return updatedProperty;
    } catch (error) {
      console.error('Transaction failed:', error);

      throw error;
    }
  }



  /**
   * Hard delete property
   */
  async delete(id) {
    return prisma.property.delete({
      where: { id: Number(id) },
    });
  }
  
  /**
   * Soft delete property by setting deletedAt timestamp
   * @param {number} id - Property ID
   * @returns {Promise<Object>} - Updated property with deletedAt timestamp
   */
  async softDelete(id) {
    try {
      const property = await prisma.property.update({
        where: { id: Number(id) },
        data: { 
          deletedAt: new Date(),
          status: 'INACTIVE'
        }
      });
      
      return property;
    } catch (error) {
      console.error('Error soft deleting property:', error);
      throw error;
    }
  }

  /**
   * Add property image
   */
  async addImage(propertyId, imageData) {
    return prisma.propertyImage.create({
      data: {
        ...imageData,
        property: {
          connect: { id: Number(propertyId) },
        },
      },
    });
  }

  /**
   * Delete property image
   */
  async deleteImage(imageId) {
    return prisma.propertyImage.delete({
      where: { id: Number(imageId) },
    });
  }

  /**
   * Add property feature
   */
  async addFeature(propertyId, featureData) {
    return prisma.propertyFeature.create({
      data: {
        ...featureData,
        property: {
          connect: { id: Number(propertyId) },
        },
      },
    });
  }

  /**
   * Delete property feature
   */
  async deleteFeature(featureId) {
    return prisma.propertyFeature.delete({
      where: { id: Number(featureId) },
    });
  }



  async findLatestPropertyCode() {
    return prisma.property.findFirst({
      orderBy: {
        propertyCode: 'desc',
      },
      select: {
        propertyCode: true,
      },
    });
    }

  /**
   * Get random properties
   * @param {number} count - Number of properties to return
   * @returns {Promise<Array>} - Random properties
   */
  async getRandomProperties(count = 4) {
    try {
      // Get all properties that match criteria
      const allProperties = await prisma.property.findMany({
        where: {
          deletedAt: null,
          isPublished: true,
          isFeatured: true, // Only featured properties
        },
        include: {
          images: true,
          listings: true,
          highlights: true,
          amenities: true,
          views: true,
          zone: true,
          labels:{
            where:{
              active:true
            },
            include:{
              Icon:true
            }
          }
        },
      });

      // Randomly shuffle the array and take the required count
      const shuffled = allProperties.sort(() => Math.random() - 0.5);
      const selectedProperties = shuffled.slice(0, Number(count));

      // If we don't have enough featured properties, get random from all published properties
      if (selectedProperties.length < count) {
        const additionalProperties = await prisma.property.findMany({
          where: {
            deletedAt: null,
            isPublished: true,
            NOT: {
              id: { in: selectedProperties.map(p => p.id) }
            }
          },
          include: {
            images: true,
            listings: true,
            highlights: true,
            amenities: true,
            views: true,
            zone: true,
            labels: {
              where: {
                active: true
              },
              include: {
                Icon: true
              }
            }
          },
        });

        // Randomly shuffle additional properties and take what we need
        const shuffledAdditional = additionalProperties.sort(() => Math.random() - 0.5);
        const needed = Number(count) - selectedProperties.length;
        selectedProperties.push(...shuffledAdditional.slice(0, needed));
      }

      // Final shuffle to mix featured and non-featured properties
      return selectedProperties.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error in getRandomProperties:', error);
      throw error;
    }
  }



  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { projectName: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { propertyCode: { contains: search } },
        { city: { contains: search } },
        { district: { contains: search } },
        { province: { contains: search } },
      ];
    }

    const total = await prisma.property.count({ where });
    let properties = [];

    if (sortBy === 'price') {
      const sortDirection = sortOrder.toUpperCase() === 'DESC' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
      
      let searchConditions = [];
      if (search) {
        const searchPattern = `%${search}%`;
        searchConditions.push(Prisma.sql`p.title LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.project_name LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.description LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.address LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.property_code LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.city LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.district LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.province LIKE ${searchPattern}`);
      }
      const whereClause = searchConditions.length > 0 ? Prisma.sql`AND (${Prisma.join(searchConditions, ' OR ')})` : Prisma.empty;

      const sortedIds = await prisma.$queryRaw`
        SELECT p.id
        FROM properties p
        LEFT JOIN property_listings l ON p.id = l.property_id
        WHERE p.deleted_at IS NULL ${whereClause}
        GROUP BY p.id
        ORDER BY AVG(l.price) ${sortDirection}
        LIMIT ${Number(limit)}
        OFFSET ${Number(skip)}
      `;

      const propertyIds = sortedIds.map(p => p.id);

      if (propertyIds.length > 0) {
        const fetchedProperties = await prisma.property.findMany({
          where: { id: { in: propertyIds } },
          include: {
            images: true,
            listings: true,
            propertyType: true,
            labels: true,
          },
        });
        
        const propertyMap = new Map(fetchedProperties.map(p => [p.id, p]));
        properties = propertyIds.map(id => propertyMap.get(id));
      }
    } else {
      properties = await prisma.property.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: Number(limit),
        include: {
          images: true,
          listings: true,
          propertyType: true,
          labels: true,
          _count: { select: { views: true } },
        },
      });
    }

    return {
      properties,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      userId: Number(userId),
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { projectName: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { propertyCode: { contains: search } },
        { city: { contains: search } },
        { district: { contains: search } },
        { province: { contains: search } },
      ];
    }

    const total = await prisma.property.count({ where });
    let properties = [];

    if (sortBy === 'price') {
      const sortDirection = sortOrder.toUpperCase() === 'DESC' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
      
      let searchConditions = [];
      if (search) {
        const searchPattern = `%${search}%`;
        searchConditions.push(Prisma.sql`p.title LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.project_name LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.description LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.address LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.property_code LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.city LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.district LIKE ${searchPattern}`);
        searchConditions.push(Prisma.sql`p.province LIKE ${searchPattern}`);
      }
      const whereClause = searchConditions.length > 0 ? Prisma.sql`AND (${Prisma.join(searchConditions, ' OR ')})` : Prisma.empty;

      const sortedIds = await prisma.$queryRaw`
        SELECT p.id
        FROM properties p
        LEFT JOIN property_listings l ON p.id = l.property_id
        WHERE p.user_id = ${Number(userId)} AND p.deleted_at IS NULL ${whereClause}
        GROUP BY p.id
        ORDER BY AVG(l.price) ${sortDirection}
        LIMIT ${Number(limit)}
        OFFSET ${Number(skip)}
      `;

      const propertyIds = sortedIds.map(p => p.id);

      if (propertyIds.length > 0) {
        const fetchedProperties = await prisma.property.findMany({
          where: { id: { in: propertyIds } },
          include: {
            images: true,
            listings: true,
            propertyType: true,
            labels: true,
          },
        });
        
        const propertyMap = new Map(fetchedProperties.map(p => [p.id, p]));
        properties = propertyIds.map(id => propertyMap.get(id));
      }
    } else {
      properties = await prisma.property.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: Number(limit),
        include: {
          images: true,
          listings: true,
          propertyType: true,
          labels: true,
          _count: { select: { views: true } },
        },
      });
    }

    const processedProperties = properties.map(property => ({
      ...property,
      viewCount: property.viewCount || 0,
      inquiryCount: property.interestedCount || 0,
      formattedDate: property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) : 'N/A',
      featuredImage: property.images && property.images.length > 0
        ? property.images.find(img => img.isFeatured) || property.images[0]
        : null,
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      properties: processedProperties,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async moveImagesFromTemp(propertyId, images) {
    const fs = require('fs');
    const path = require('path');

    try {
      console.log(`Starting to move ${images.length} images for property ${propertyId}`);
      console.log('Images before moving:', JSON.stringify(images, null, 2));
      
      // Create property directory if it doesn't exist
      const propertyDir = path.join(__dirname, '../../public/images/properties', propertyId.toString());
      if (!fs.existsSync(propertyDir)) {
        fs.mkdirSync(propertyDir, { recursive: true });
      }

      // Create subdirectories
      const floorPlansDir = path.join(propertyDir, 'floor-plans');
      if (!fs.existsSync(floorPlansDir)) {
        fs.mkdirSync(floorPlansDir, { recursive: true });
      }

      const unitPlansDir = path.join(propertyDir, 'unit-plans');
      if (!fs.existsSync(unitPlansDir)) {
        fs.mkdirSync(unitPlansDir, { recursive: true });
      }

      // Process each image
      for (const image of images) {
        if (!image.url) continue;

        // Get image path relative to /public
        const relativePath = image.url.startsWith('/') ? image.url.substring(1) : image.url;
        const oldPath = path.join(__dirname, '../../public', relativePath);

        // Replace 'temp' with actual propertyId in URL and path
        const newRelativePath = relativePath.replace('/properties/temp/', `/properties/${propertyId}/`);
        const newPath = path.join(__dirname, '../../public', newRelativePath);

        console.log(`Moving image from ${oldPath} to ${newPath}`);

        // Move file if it exists
        if (fs.existsSync(oldPath)) {
          // Make sure directory exists
          const newDir = path.dirname(newPath);
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }

          // Move the file
          fs.renameSync(oldPath, newPath);
          
          // Update the URL in the image object
          image.url = '/' + newRelativePath;
          console.log(`Updated image URL to: ${image.url}`);
        } else {
          console.log(`Source file does not exist: ${oldPath}`);
        }
      }

      console.log('Images after moving:', JSON.stringify(images, null, 2));
      console.log(`Successfully moved images for property ${propertyId}`);
    } catch (error) {
      console.error('Error moving images:', error);
      // Continue processing - don't throw error as property is already created
    }
  }

  async moveFloorPlanImagesFromTemp(propertyId, floorPlans) {
    const fs = require('fs');
    const path = require('path');

    try {
      // Create property directory if it doesn't exist
      const propertyDir = path.join(__dirname, '../../public/images/properties', propertyId.toString(), 'floor-plans');
      if (!fs.existsSync(propertyDir)) {
        fs.mkdirSync(propertyDir, { recursive: true });
      }

      // Process each floor plan image
      for (const plan of floorPlans) {
        if (!plan.url) continue;

        // Get image path relative to /public
        const relativePath = plan.url.startsWith('/') ? plan.url.substring(1) : plan.url;
        const oldPath = path.join(__dirname, '../../public', relativePath);

        // Replace 'temp' with actual propertyId in URL and path
        const newRelativePath = relativePath.replace('/properties/temp/', `/properties/${propertyId}/`);
        const newPath = path.join(__dirname, '../../public', newRelativePath);

        // Move file if it exists
        if (fs.existsSync(oldPath)) {
          // Make sure directory exists
          const newDir = path.dirname(newPath);
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }

          // Move the file
          fs.renameSync(oldPath, newPath);
          
          // Update the URL in the plan object
          plan.url = '/' + newRelativePath;
        }
      }

      // Log success
      console.log(`Successfully moved floor plan images for property ${propertyId}`);
    } catch (error) {
      console.error('Error moving floor plan images:', error);
      // Continue processing - don't throw error as property is already created
    }
  }

  async moveUnitPlanImagesFromTemp(propertyId, unitPlans) {
    const fs = require('fs');
    const path = require('path');

    try {
      // Create property directory if it doesn't exist
      const propertyDir = path.join(__dirname, '../../public/images/properties', propertyId.toString(), 'unit-plans');
      if (!fs.existsSync(propertyDir)) {
        fs.mkdirSync(propertyDir, { recursive: true });
      }

      // Process each unit plan image
      for (const plan of unitPlans) {
        if (!plan.url) continue;

        // Get image path relative to /public
        const relativePath = plan.url.startsWith('/') ? plan.url.substring(1) : plan.url;
        const oldPath = path.join(__dirname, '../../public', relativePath);

        // Replace 'temp' with actual propertyId in URL and path
        const newRelativePath = relativePath.replace('/properties/temp/', `/properties/${propertyId}/`);
        const newPath = path.join(__dirname, '../../public', newRelativePath);

        // Move file if it exists
        if (fs.existsSync(oldPath)) {
          // Make sure directory exists
          const newDir = path.dirname(newPath);
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }

          // Move the file
          fs.renameSync(oldPath, newPath);
          
          // Update the URL in the plan object
          plan.url = '/' + newRelativePath;
        }
      }

      // Log success
      console.log(`Successfully moved unit plan images for property ${propertyId}`);
    } catch (error) {
      console.error('Error moving unit plan images:', error);
      // Continue processing - don't throw error as property is already created
    }
  }
}

module.exports = new PropertyRepository();
