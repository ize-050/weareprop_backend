const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding properties...');

  // ตรวจสอบว่ามี admin user หรือไม่
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@dluckproperty.com' }
  });

  // ถ้าไม่มี admin user ให้สร้างใหม่
  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@dluckproperty.com',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User',
        phone: '+66 89 123 4567'
      }
    });
    
    console.log(`Admin user created: ${adminUser.email}`);
  } else {
    console.log(`Using existing admin user: ${adminUser.email}`);
  }

  // ตรวจสอบว่ามี Zone หรือไม่
  const zoneCount = await prisma.zone.count();
  
  // ถ้าไม่มี Zone ให้สร้างใหม่
  if (zoneCount === 0) {
    // สร้างข้อมูล Zone สำหรับพัทยา
    const pattayaZones = [
      {
        name: 'Jomtien',
        nameEn: 'Jomtien',
        nameTh: 'จอมเทียน',
        description: 'Jomtien Beach is a popular tourist destination located on the east coast of the Gulf of Thailand about 165 km south-east of Bangkok.',
        city: 'Pattaya',
        province: 'Chonburi'
      },
      {
        name: 'Pratumnak',
        nameEn: 'Pratumnak',
        nameTh: 'พระตำหนัก',
        description: 'Pratumnak Hill is the area between Pattaya and Jomtien Beach, known for its upscale residential properties.',
        city: 'Pattaya',
        province: 'Chonburi'
      },
      {
        name: 'Naklua',
        nameEn: 'Naklua',
        nameTh: 'นาเกลือ',
        description: 'Naklua is a more traditional Thai area north of Pattaya Beach, known for its seafood restaurants and local markets.',
        city: 'Pattaya',
        province: 'Chonburi'
      },
      {
        name: 'Central Pattaya',
        nameEn: 'Central Pattaya',
        nameTh: 'พัทยากลาง',
        description: 'The heart of Pattaya city, known for its shopping malls, restaurants, and nightlife.',
        city: 'Pattaya',
        province: 'Chonburi'
      },
      {
        name: 'East Pattaya',
        nameEn: 'East Pattaya',
        nameTh: 'พัทยาตะวันออก',
        description: 'A rapidly developing area with many housing developments and golf courses.',
        city: 'Pattaya',
        province: 'Chonburi'
      }
    ];
    
    for (const zoneData of pattayaZones) {
      await prisma.zone.create({
        data: zoneData
      });
    }
    
    console.log(`Created ${pattayaZones.length} zones for Pattaya`);
  } else {
    console.log(`Using existing zones (${zoneCount} zones found)`);
  }

  // ดึงข้อมูล Zone ทั้งหมด
  const zones = await prisma.zone.findMany();

  // ข้อมูล property ตัวอย่าง
  const properties = [
    {
      title: "The Riviera Monaco Luxury Condo",
      projectName: "The Riviera Monaco",
      propertyType: "CONDO",
      address: "123 Jomtien Beach Road",
      district: "Banglamung",
      subdistrict: "Jomtien",
      province: "Chonburi",
      city: "Pattaya",
      zipCode: "20150",
      latitude: 12.8683,
      longitude: 100.8966,
      area: 75.5,
      usableArea: 65.0,
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
      furnishing: "FULLY_FURNISHED",
      constructionYear: 2020,
      communityFee: 50,
      buildingUnit: "A",
      floor: 15,
      description: "Luxury sea view condo in Jomtien with stunning panoramic views of the ocean. This fully furnished 2-bedroom unit features high-end finishes, a modern kitchen, and a spacious balcony perfect for enjoying the sunset. The property includes access to premium facilities such as an infinity pool, fitness center, and 24-hour security.",
      translatedTitles: {
        en: "The Riviera Monaco Luxury Condo",
        th: "คอนโดหรู ริเวียร่า โมนาโค วิวทะเล",
        zh: "摩纳哥海景豪华公寓",
        ru: "Роскошные апартаменты с видом на море Ривьера Монако"
      },
      translatedDescriptions: {
        en: "Luxury sea view condo in Jomtien with stunning panoramic views of the ocean. This fully furnished 2-bedroom unit features high-end finishes, a modern kitchen, and a spacious balcony perfect for enjoying the sunset. The property includes access to premium facilities such as an infinity pool, fitness center, and 24-hour security.",
        th: "คอนโดหรูวิวทะเลที่จอมเทียนพร้อมวิวพาโนรามาอันงดงามของมหาสมุทร ยูนิต 2 ห้องนอนที่ตกแต่งอย่างครบครันนี้มาพร้อมกับงานตกแต่งระดับไฮเอนด์ ห้องครัวทันสมัย และระเบียงกว้างขวางเหมาะสำหรับการชมพระอาทิตย์ตก ทรัพย์สินนี้รวมถึงการเข้าถึงสิ่งอำนวยความสะดวกระดับพรีเมียม เช่น สระว่ายน้ำอินฟินิตี้ ฟิตเนส และระบบรักษาความปลอดภัย 24 ชั่วโมง",
        zh: "位于宗滴恩的豪华海景公寓，可欣赏到壮丽的海洋全景。这套精装修的两居室单元配有高端装饰，现代厨房和宽敞的阳台，非常适合欣赏日落。该物业包括使用高级设施，如无边泳池，健身中心和24小时安保。",
        ru: "Роскошные апартаменты с видом на море в Джомтьене с потрясающими панорамными видами на океан. Эти полностью меблированные апартаменты с 2 спальнями отличаются высококлассной отделкой, современной кухней и просторным балконом, идеально подходящим для наслаждения закатом. Недвижимость включает доступ к первоклассным удобствам, таким как бассейн-инфинити, фитнес-центр и круглосуточная охрана."
      },
      paymentPlan: "30% down payment, 70% upon completion",
      translatedPaymentPlans: {
        en: "30% down payment, 70% upon completion",
        th: "เงินดาวน์ 30%, 70% เมื่อสร้างเสร็จ",
        zh: "30%首付，70%完工时支付",
        ru: "30% первоначальный взнос, 70% по завершении строительства"
      },
      socialMedia: {
        youtubeUrl: "https://www.youtube.com/watch?v=example1",
        tiktokUrl: "https://www.tiktok.com/@example1"
      },
      contactInfo: {
        phone: "+66 89 123 4567",
        email: "contact@dluckproperty.com",
        lineId: "dluckproperty",
        wechatId: "dluckproperty",
        whatsapp: "+66 89 123 4567"
      },
      status: "ACTIVE",
      userId: adminUser.id,
      zoneId: zones.find(zone => zone.name === 'Jomtien')?.id,
      propertyFolderName: "1"
    },
    {
      title: "Luxury Villa with Private Pool",
      projectName: "Palm Oasis Villas",
      propertyType: "VILLA",
      address: "88 Pratumnak Hill Road",
      district: "Banglamung",
      subdistrict: "Pratumnak",
      province: "Chonburi",
      city: "Pattaya",
      zipCode: "20150",
      latitude: 12.9211,
      longitude: 100.8659,
      area: 350.0,
      usableArea: 300.0,
      landSizeRai: 0.25,
      landSizeNgan: 1,
      landSizeSqWah: 0,
      bedrooms: 4,
      bathrooms: 5,
      floors: 2,
      furnishing: "FULLY_FURNISHED",
      constructionYear: 2021,
      description: "Stunning luxury villa in the prestigious Pratumnak Hill area. This 4-bedroom villa features a private swimming pool, lush tropical garden, and spacious living areas perfect for entertaining. The property offers privacy and tranquility while being just minutes away from Pattaya's attractions and beaches.",
      translatedTitles: {
        th: "วิลล่าหรูพร้อมสระว่ายน้ำส่วนตัว",
        zh: "带私人泳池的豪华别墅",
        ru: "Роскошная вилла с частным бассейном"
      },
      status: "ACTIVE",
      userId: adminUser.id,
      zoneId: zones.find(zone => zone.name === 'Pratumnak')?.id,
      propertyFolderName: "2"
    },
    {
      title: "Modern Beachfront Apartment",
      projectName: "Naklua Beach Residences",
      propertyType: "CONDO",
      address: "456 Naklua Beach Road",
      district: "Banglamung",
      subdistrict: "Naklua",
      province: "Chonburi",
      city: "Pattaya",
      zipCode: "20150",
      latitude: 12.9697,
      longitude: 100.8880,
      area: 85.0,
      usableArea: 75.0,
      bedrooms: 1,
      bathrooms: 1,
      floors: 1,
      furnishing: "PARTIALLY_FURNISHED",
      constructionYear: 2019,
      communityFee: 40,
      buildingUnit: "C",
      floor: 8,
      description: "Beautiful beachfront apartment with direct access to Naklua Beach. This modern 1-bedroom unit offers panoramic sea views and comes partially furnished with high-quality fixtures and appliances. The development features a beachfront swimming pool, fitness center, and 24-hour security.",
      status: "ACTIVE",
      userId: adminUser.id,
      zoneId: zones.find(zone => zone.name === 'Naklua')?.id,
      propertyFolderName: "3"
    },
    {
      title: "Central Pattaya Luxury Penthouse",
      projectName: "The Urban Skyline",
      propertyType: "CONDO",
      address: "789 Central Pattaya Road",
      district: "Banglamung",
      subdistrict: "Pattaya City",
      province: "Chonburi",
      city: "Pattaya",
      zipCode: "20150",
      latitude: 12.9279,
      longitude: 100.8820,
      area: 180.0,
      usableArea: 165.0,
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      furnishing: "FULLY_FURNISHED",
      constructionYear: 2018,
      communityFee: 80,
      buildingUnit: "PH",
      floor: 35,
      description: "Spectacular duplex penthouse in the heart of Central Pattaya. This 3-bedroom luxury unit spans two floors with floor-to-ceiling windows offering breathtaking city and sea views. Features include a private jacuzzi, gourmet kitchen, and premium furnishings throughout. The building offers 5-star amenities including an infinity pool, sky lounge, and concierge services.",
      status: "ACTIVE",
      userId: adminUser.id,
      zoneId: zones.find(zone => zone.name === 'Central Pattaya')?.id,
      propertyFolderName: "4"
    },
    {
      title: "East Pattaya Family Home",
      projectName: "Green Valley Estates",
      propertyType: "HOUSE",
      address: "123 Siam Country Club Road",
      district: "Banglamung",
      subdistrict: "Nongprue",
      province: "Chonburi",
      city: "Pattaya",
      zipCode: "20150",
      latitude: 12.9343,
      longitude: 100.9292,
      area: 250.0,
      usableArea: 220.0,
      landSizeRai: 0.125,
      landSizeNgan: 0.5,
      landSizeSqWah: 0,
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      furnishing: "PARTIALLY_FURNISHED",
      constructionYear: 2017,
      description: "Spacious family home in a quiet East Pattaya neighborhood. This 3-bedroom house features a garden, covered parking for two cars, and a modern kitchen. Located in a secure gated community with a communal swimming pool and playground, it's perfect for families. Close to international schools, shopping centers, and golf courses.",
      status: "ACTIVE",
      userId: adminUser.id,
      zoneId: zones.find(zone => zone.name === 'East Pattaya')?.id,
      propertyFolderName: "5"
    }
  ];

  // สร้างข้อมูล property และข้อมูลที่เกี่ยวข้อง
  for (const propertyData of properties) {
    const { propertyFolderName, ...data } = propertyData;
    
    // ตรวจสอบว่ามี property นี้อยู่แล้วหรือไม่
    const existingProperty = await prisma.property.findFirst({
      where: {
        title: data.title,
        projectName: data.projectName
      }
    });
    
    if (existingProperty) {
      console.log(`Property already exists: ${data.title}`);
      continue;
    }
    
    // สร้าง property
    const property = await prisma.property.create({
      data: {
        ...data,
        
        // เพิ่ม features
        features: {
          create: [
            { name: 'airConditioner', value: 'true' },
            { name: 'wifi', value: 'true' },
            { name: 'parking', value: 'true' }
          ]
        },
        
        // เพิ่ม amenities
        amenities: {
          create: [
            { amenityType: 'AIR_CONDITIONER' },
            { amenityType: 'WIFI' },
            { amenityType: 'REFRIGERATOR' }
          ]
        },
        
        // เพิ่ม facilities
        facilities: {
          create: [
            { facilityType: 'SWIMMING_POOL', facilityCategory: 'POOLS_SPA_RELAXATION' },
            { facilityType: 'FITNESS', facilityCategory: 'FITNESS_SPORTS' },
            { facilityType: 'SECURITY_24HR', facilityCategory: 'OTHER' }
          ]
        },
        
        // เพิ่ม views
        views: {
          create: data.propertyType === 'CONDO' ? [
            { viewType: 'SEA_VIEW' },
            { viewType: 'CITY_VIEW' }
          ] : [
            { viewType: 'GARDEN_VIEW' }
          ]
        },
        
        // เพิ่ม highlights
        highlights: {
          create: [
            { highlightType: 'BRAND_NEW_PROPERTY' },
            { highlightType: data.propertyType === 'CONDO' ? 'PENTHOUSE' : 'PETS_ALLOWED' }
          ]
        },
        
        // เพิ่ม labels
        labels: {
          create: [
            { labelType: 'NEW_LISTING' },
            { labelType: 'HOT_OFFER' }
          ]
        },
        
        // เพิ่ม nearby places
        nearbyPlaces: {
          create: [
            { nearbyType: 'NEAR_BEACH', distance: 0.5 },
            { nearbyType: 'NEAR_MALL', distance: 1.2 }
          ]
        }
      }
    });
    
    console.log(`Created property: ${property.title} (ID: ${property.id})`);
    
    // เพิ่มรูปภาพจากโฟลเดอร์ที่มีอยู่
    const imagesDir = path.join(__dirname, '..', 'public', 'images', 'properties', propertyFolderName);
    
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const imageUrl = `/images/properties/${propertyFolderName}/${imageFile}`;
        
        await prisma.propertyImage.create({
          data: {
            url: imageUrl,
            isFeatured: i === 0, // รูปแรกเป็นรูปหลัก
            sortOrder: i,
            propertyId: property.id
          }
        });
      }
      
      console.log(`Added ${imageFiles.length} images for property ID ${property.id}`);
    } else {
      console.log(`Warning: Image directory not found for property ID ${property.id}: ${imagesDir}`);
    }
    
    // สร้าง listing สำหรับการขาย
    await prisma.propertyListing.create({
      data: {
        listingType: 'SALE',
        status: 'ACTIVE',
        price: data.propertyType === 'CONDO' ? 
          (data.area * 100000) : // คอนโดราคาตารางเมตรละ 100,000 บาท
          (data.area * 80000),   // บ้านราคาตารางเมตรละ 80,000 บาท
        pricePerSqm: data.propertyType === 'CONDO' ? 100000 : 80000,
        currency: 'THB',
        propertyId: property.id,
        userId: adminUser.id,
        contactName: 'Admin User',
        contactPhone: '+66 89 123 4567',
        contactEmail: 'contact@dluckproperty.com'
      }
    });
    
    // สร้าง listing สำหรับการเช่า (เฉพาะคอนโด)
    if (data.propertyType === 'CONDO') {
      await prisma.propertyListing.create({
        data: {
          listingType: 'RENT',
          status: 'ACTIVE',
          price: data.area * 350, // ค่าเช่าตารางเมตรละ 350 บาท
          currency: 'THB',
          minimumStay: 6, // ขั้นต่ำ 6 เดือน
          propertyId: property.id,
          userId: adminUser.id,
          contactName: 'Admin User',
          contactPhone: '+66 89 123 4567',
          contactEmail: 'contact@dluckproperty.com'
        }
      });
    }
    
    console.log(`Created listings for property ID ${property.id}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
