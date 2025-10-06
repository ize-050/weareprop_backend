import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ปิดการใช้งาน bodyParser เพื่อให้สามารถรับ FormData ได้
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * สร้างไดเรกทอรีสำหรับเก็บรูปภาพ
 */
const createUploadDirectories = (propertyId) => {
  const baseDir = path.join(process.cwd(), 'public', 'images', 'properties', propertyId);
  const floorPlansDir = path.join(baseDir, 'floor-plans');
  const unitPlansDir = path.join(baseDir, 'unit-plans');
  
  // สร้างไดเรกทอรีหลักสำหรับรูปภาพ
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // สร้างไดเรกทอรีสำหรับ floor plans
  if (!fs.existsSync(floorPlansDir)) {
    fs.mkdirSync(floorPlansDir, { recursive: true });
  }
  
  // สร้างไดเรกทอรีสำหรับ unit plans
  if (!fs.existsSync(unitPlansDir)) {
    fs.mkdirSync(unitPlansDir, { recursive: true });
  }
  
  return { baseDir, floorPlansDir, unitPlansDir };
};

/**
 * แปลง FormData เป็น Object
 */
const parseFormData = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir: path.join(process.cwd(), 'tmp'),
      keepExtensions: true,
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({ fields, files });
    });
  });
};

/**
 * บันทึกรูปภาพลงในไดเรกทอรี
 */
const saveImages = (files, directories) => {
  const { baseDir, floorPlansDir, unitPlansDir } = directories;
  const imageData = {
    propertyImages: [],
    floorPlanImages: [],
    unitPlanImages: [],
  };
  
  // บันทึกรูปภาพหลักของ property
  if (files.images) {
    const images = Array.isArray(files.images) ? files.images : [files.images];
    
    images.forEach((image, index) => {
      const uniqueFilename = `property-${Date.now()}-${index}-${path.basename(image.filepath)}`;
      const targetPath = path.join(baseDir, uniqueFilename);
      
      fs.copyFileSync(image.filepath, targetPath);
      fs.unlinkSync(image.filepath); // ลบไฟล์ชั่วคราว
      
      imageData.propertyImages.push({
        url: `/images/properties/${directories.propertyId}/${uniqueFilename}`,
        isFeatured: index === 0,
        sortOrder: index,
      });
    });
  }
  
  // บันทึกรูปภาพ floor plans
  if (files.floorPlanImages) {
    const floorPlans = Array.isArray(files.floorPlanImages) ? files.floorPlanImages : [files.floorPlanImages];
    
    floorPlans.forEach((plan, index) => {
      const uniqueFilename = `floor-plan-${Date.now()}-${index}-${path.basename(plan.filepath)}`;
      const targetPath = path.join(floorPlansDir, uniqueFilename);
      
      fs.copyFileSync(plan.filepath, targetPath);
      fs.unlinkSync(plan.filepath); // ลบไฟล์ชั่วคราว
      
      imageData.floorPlanImages.push({
        url: `/images/properties/${directories.propertyId}/floor-plans/${uniqueFilename}`,
        title: `Floor Plan ${index + 1}`,
        sortOrder: index,
      });
    });
  }
  
  // บันทึกรูปภาพ unit plans
  if (files.unitPlanImages) {
    const unitPlans = Array.isArray(files.unitPlanImages) ? files.unitPlanImages : [files.unitPlanImages];
    
    unitPlans.forEach((plan, index) => {
      const uniqueFilename = `unit-plan-${Date.now()}-${index}-${path.basename(plan.filepath)}`;
      const targetPath = path.join(unitPlansDir, uniqueFilename);
      
      fs.copyFileSync(plan.filepath, targetPath);
      fs.unlinkSync(plan.filepath); // ลบไฟล์ชั่วคราว
      
      imageData.unitPlanImages.push({
        url: `/images/properties/${directories.propertyId}/unit-plans/${uniqueFilename}`,
        title: `Unit Plan ${index + 1}`,
        unitType: '',
        area: null,
        bedrooms: null,
        bathrooms: null,
        sortOrder: index,
      });
    });
  }
  
  return imageData;
};

/**
 * แปลง field จาก string เป็น type ที่ถูกต้อง
 */
const processFormFields = (fields) => {
  const processedData = {};
  
  // แปลง field เป็น object ที่เหมาะสม
  for (const [key, value] of Object.entries(fields)) {
    // ถ้าเป็น array (formidable จะส่งมาเป็น array)
    if (Array.isArray(value)) {
      processedData[key] = value[0];
    } else {
      processedData[key] = value;
    }
    
    // แปลง JSON string เป็น object
    try {
      if (
        typeof processedData[key] === 'string' && 
        (
          key === 'features' || 
          key === 'highlights' || 
          key === 'nearby' || 
          key === 'views' || 
          key === 'facilities' || 
          key === 'contactInfo' || 
          key === 'socialMedia' || 
          key === 'translatedTitles' || 
          key === 'translatedDescriptions' || 
          key === 'translatedPaymentPlans'
        )
      ) {
        processedData[key] = JSON.parse(processedData[key]);
      }
    } catch (error) {
      console.error(`Error parsing JSON for field ${key}:`, error);
    }
  }
  
  return processedData;
};

/**
 * สร้าง property ใหม่
 */
export async function POST(req) {
  try {
    // ตรวจสอบการ authentication (ในตัวอย่างนี้ให้ใช้ userId = 1)
    const userId = 1; // ควรเปลี่ยนเป็นการดึงจาก session หรือ token
    
    // สร้าง property ID ชั่วคราว
    const tempPropertyId = uuidv4();
    
    // สร้างไดเรกทอรีสำหรับเก็บรูปภาพ
    const directories = createUploadDirectories(tempPropertyId);
    directories.propertyId = tempPropertyId;
    
    // แปลง FormData เป็น Object
    const { fields, files } = await parseFormData(req);
    
    // บันทึกรูปภาพ
    const imageData = saveImages(files, directories);
    
    // แปลง field จาก string เป็น type ที่ถูกต้อง
    const processedData = processFormFields(fields);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    const requiredFields = ['title', 'projectName', 'propertyType', 'address', 'district', 'province', 'city', 'zipCode', 'area', 'description'];
    const missingFields = requiredFields.filter(field => !processedData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing required fields', 
          missingFields 
        }, 
        { status: 400 }
      );
    }
    
    // สร้าง property data
    const propertyData = {
      // Basic property info
      title: processedData.title,
      projectName: processedData.projectName,
      propertyCode: processedData.propertyCode,
      referenceId: processedData.referenceId,
      propertyType: processedData.propertyType,
      
      // Address info
      address: processedData.address,
      searchAddress: processedData.searchAddress,
      district: processedData.district,
      subdistrict: processedData.subdistrict,
      province: processedData.province,
      city: processedData.city,
      country: processedData.country || 'Thailand',
      zipCode: processedData.zipCode,
      latitude: processedData.latitude ? parseFloat(processedData.latitude) : null,
      longitude: processedData.longitude ? parseFloat(processedData.longitude) : null,
      
      // Zone relation
      zoneId: processedData.zoneId ? parseInt(processedData.zoneId) : null,
      
      // Area info
      area: processedData.area ? parseFloat(processedData.area) : null,
      usableArea: processedData.usableArea ? parseFloat(processedData.usableArea) : null,
      
      // Land info
      landSizeRai: processedData.landSizeRai ? parseFloat(processedData.landSizeRai) : null,
      landSizeNgan: processedData.landSizeNgan ? parseFloat(processedData.landSizeNgan) : null,
      landSizeSqWah: processedData.landSizeSqWah ? parseFloat(processedData.landSizeSqWah) : null,
      landWidth: processedData.landWidth ? parseFloat(processedData.landWidth) : null,
      landLength: processedData.landLength ? parseFloat(processedData.landLength) : null,
      landShape: processedData.landShape,
      
      landGrade: processedData.landGrade,
      landAccess: processedData.landAccess,
      ownershipType: processedData.ownershipType,
      ownershipQuota: processedData.ownershipQuota,
      
      // Building info
      bedrooms: processedData.bedrooms ? parseInt(processedData.bedrooms) : null,
      bathrooms: processedData.bathrooms ? parseInt(processedData.bathrooms) : null,
      floors: processedData.floors ? parseInt(processedData.floors) : null,
      furnishing: processedData.furnishing,
      constructionYear: processedData.constructionYear ? parseInt(processedData.constructionYear) : null,
      communityFee: processedData.communityFee ? parseFloat(processedData.communityFee) : null,
      buildingUnit: processedData.buildingUnit,
      floor: processedData.floor ? parseInt(processedData.floor) : null,
      
      // Multilingual content
      description: processedData.description,
      translatedTitles: processedData.translatedTitles,
      translatedDescriptions: processedData.translatedDescriptions,
      paymentPlan: processedData.paymentPlan,
      translatedPaymentPlans: processedData.translatedPaymentPlans,
      
      // Contact and social media
      socialMedia: processedData.socialMedia,
      contactInfo: processedData.contactInfo,
      
      // User relation
      userId,
      
      // Images
      images: {
        create: imageData.propertyImages,
      },
      
      // Unit Plans
      unitPlans: {
        create: imageData.unitPlanImages,
      },
      
      // Features, Amenities, Facilities, etc.
      features: processedData.features ? {
        create: Array.isArray(processedData.features) ? 
          processedData.features.map(feature => ({
            name: feature.name,
            value: feature.value,
          })) : []
      } : undefined,
      
      amenities: processedData.amenities ? {
        create: Array.isArray(processedData.amenities) ? 
          processedData.amenities.map(amenity => ({
            amenityType: amenity,
          })) : []
      } : undefined,
      
      facilities: processedData.facilities ? {
        create: Array.isArray(processedData.facilities) ? 
          processedData.facilities.map(facility => ({
            facilityType: facility.type,
            facilityCategory: facility.category,
          })) : []
      } : undefined,
      
      views: processedData.views ? {
        create: Array.isArray(processedData.views) ? 
          processedData.views.map(view => ({
            viewType: view,
          })) : []
      } : undefined,
      
      highlights: processedData.highlights ? {
        create: Array.isArray(processedData.highlights) ? 
          processedData.highlights.map(highlight => ({
            highlightType: highlight,
          })) : []
      } : undefined,
      
      labels: processedData.labels ? {
        create: Array.isArray(processedData.labels) ? 
          processedData.labels.map(label => ({
            labelType: label,
          })) : []
      } : undefined,
      
      nearbyPlaces: processedData.nearby ? {
        create: Array.isArray(processedData.nearby) ? 
          processedData.nearby.map(nearby => ({
            nearbyType: nearby.type,
            distance: nearby.distance,
          })) : []
      } : undefined,
    };
    
    // สร้าง property ใน database
    const property = await prisma.property.create({
      data: propertyData,
      include: {
        images: true,
        features: true,
        amenities: true,
        facilities: true,
        views: true,
        highlights: true,
        labels: true,
        nearbyPlaces: true,
        unitPlans: true,
      },
    });
    
    // สร้าง listing ถ้ามีข้อมูล listing
    if (processedData.listingType) {
      const listingData = {
        listingType: processedData.listingType,
        price: processedData.price ? parseFloat(processedData.price) : 0,
        pricePerSqm: processedData.pricePerSqm ? parseFloat(processedData.pricePerSqm) : null,
        promotionalPrice: processedData.promotionalPrice ? parseFloat(processedData.promotionalPrice) : null,
        currency: processedData.currency || 'THB',
        minimumStay: processedData.minimumStay ? parseInt(processedData.minimumStay) : null,
        availableFrom: processedData.availableFrom ? new Date(processedData.availableFrom) : null,
        privateNote: processedData.privateNote,
        youtubeUrl: processedData.youtubeUrl,
        tiktokUrl: processedData.tiktokUrl,
        
        // Co-Agent settings
        allowCoAgent: processedData.allowCoAgent === 'true' || processedData.allowCoAgent === true,
        commissionType: processedData.commissionType,
        commissionPercent: processedData.commissionPercent ? parseFloat(processedData.commissionPercent) : null,
        commissionAmount: processedData.commissionAmount ? parseFloat(processedData.commissionAmount) : null,
        commissionCurrency: processedData.commissionCurrency || 'THB',
        
        // Contact information
        contactName: processedData.contactName,
        contactPhone: processedData.contactPhone,
        contactPhoneAlt: processedData.contactPhoneAlt,
        contactEmail: processedData.contactEmail,
        contactLineId: processedData.contactLineId,
        contactWechatId: processedData.contactWechatId,
        contactWhatsapp: processedData.contactWhatsapp,
        contactFacebook: processedData.contactFacebook,
        contactInstagram: processedData.contactInstagram,
        useProfileContact: processedData.useProfileContact === 'true' || processedData.useProfileContact === true,
        
        // Relations
        propertyId: property.id,
        userId,
        
        // Floor Plans
        floorPlans: {
          create: imageData.floorPlanImages,
        },
      };
      
      await prisma.propertyListing.create({
        data: listingData,
      });
    }
    
    return NextResponse.json({ 
      status: 'success', 
      data: property,
    });
    
  } catch (error) {
    console.error('Error creating property:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to create property', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * ดึงข้อมูล properties ทั้งหมด
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        skip,
        take: limit,
        where: {
          deletedAt: null, // กรองเฉพาะรายการที่ยังไม่ถูก soft delete
          isPublished: true, // กรองเฉพาะรายการที่ publish แล้ว
        },
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
          listings: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.property.count({
        where: {
          deletedAt: null,
          isPublished: true,
        },
      }),
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return NextResponse.json({
      status: 'success',
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch properties', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
