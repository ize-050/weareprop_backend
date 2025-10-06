const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // สร้างผู้ใช้ตัวอย่าง
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '0812345678',
      role: 'ADMIN',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      password: hashedPassword,
      name: 'Agent User',
      phone: '0823456789',
      lineId: 'agent_line',
      role: 'AGENT',
    },
  });

  console.log(`Created users: ${admin.id}, ${agent.id}`);
  
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
  
  // สร้างข้อมูล Zone สำหรับกรุงเทพฯ
  const bangkokZones = [
    {
      name: 'Sukhumvit',
      nameEn: 'Sukhumvit',
      nameTh: 'สุขุมวิท',
      description: 'One of Bangkok\'s main commercial and residential areas, popular with expats and tourists.',
      city: 'Bangkok',
      province: 'Bangkok'
    },
    {
      name: 'Silom',
      nameEn: 'Silom',
      nameTh: 'สีลม',
      description: 'Bangkok\'s financial district with many office buildings, hotels, and nightlife venues.',
      city: 'Bangkok',
      province: 'Bangkok'
    },
    {
      name: 'Sathorn',
      nameEn: 'Sathorn',
      nameTh: 'สาทร',
      description: 'A business district with many embassies, luxury condominiums, and hotels.',
      city: 'Bangkok',
      province: 'Bangkok'
    },
    {
      name: 'Thonglor',
      nameEn: 'Thonglor',
      nameTh: 'ทองหล่อ',
      description: 'An upscale area known for its trendy restaurants, cafes, and nightlife.',
      city: 'Bangkok',
      province: 'Bangkok'
    },
    {
      name: 'Asoke',
      nameEn: 'Asoke',
      nameTh: 'อโศก',
      description: 'A central business area with many shopping malls and office buildings.',
      city: 'Bangkok',
      province: 'Bangkok'
    }
  ];
  
  // บันทึกข้อมูล Zone ลงในฐานข้อมูล
  for (const zoneData of [...pattayaZones, ...bangkokZones]) {
    await prisma.zone.upsert({
      where: { name: zoneData.name },
      update: zoneData,
      create: zoneData,
    });
  }
  
  console.log(`Created zones: ${pattayaZones.length + bangkokZones.length} zones`);

  // สร้างข้อมูลบ้านในพัทยา 5 ชุด
  const houses = [
    {
      projectName: 'The Vineyard Pattaya',
      propertyCode: 'DP000001',
      propertyType: 'HOUSE',
      address: '123 Moo 5, Soi Khao Talo, Pattaya, Chonburi',
      searchAddress: 'The Vineyard Pattaya Khao Talo Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9135,
      longitude: 100.9003,
      area: 350,
      usableArea: 300,
      landSizeRai: 0,
      landSizeNgan: 1,
      landSizeSqWah: 50,
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2019,
      communityFee: 3000,
      description: JSON.stringify({
        th: 'บ้านเดี่ยว 2 ชั้น 4 ห้องนอน 3 ห้องน้ำ ในโครงการ The Vineyard พัทยา พร้อมสระว่ายน้ำส่วนตัว วิวสวย ใกล้ชายหาด',
        en: 'Two-story single house with 4 bedrooms, 3 bathrooms in The Vineyard Pattaya project with private pool, beautiful view, near the beach',
        zh: 'The Vineyard芭堤雅项目中的双层独立式住宅，设有4间卧室和3间浴室，带私人泳池，景色优美，靠近海滩',
        ru: 'Двухэтажный отдельный дом с 4 спальнями и 3 ванными комнатами в проекте The Vineyard Pattaya с частным бассейном, красивым видом, рядом с пляжем'
      }),
      userId: agent.id
    },
    {
      projectName: 'Baan Dusit Pattaya',
      propertyCode: 'DP000002',
      propertyType: 'HOUSE',
      address: '88/8 Moo 9, Soi Siam Country Club, East Pattaya, Chonburi',
      searchAddress: 'Baan Dusit Pattaya Siam Country Club East Pattaya Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9339,
      longitude: 100.9392,
      area: 280,
      usableArea: 240,
      landSizeRai: 0,
      landSizeNgan: 1,
      landSizeSqWah: 0,
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      furnishing: 'PARTIALLY_FURNISHED',
      constructionYear: 2018,
      communityFee: 2000,
      description: JSON.stringify({
        th: 'บ้านเดี่ยว 2 ชั้น 3 ห้องนอน 3 ห้องน้ำ ในโครงการ Baan Dusit พัทยา ใกล้สนามกอล์ฟ Siam Country Club',
        en: 'Two-story single house with 3 bedrooms, 3 bathrooms in Baan Dusit Pattaya project, near Siam Country Club golf course',
        zh: 'Baan Dusit芭堤雅项目中的双层独立式住宅，设有3间卧室和3间浴室，靠近暹罗乡村俱乐部高尔夫球场',
        ru: 'Двухэтажный отдельный дом с 3 спальнями и 3 ванными комнатами в проекте Baan Dusit Pattaya, рядом с полем для гольфа Siam Country Club'
      }),
      userId: agent.id
    },
    {
      projectName: 'Pattaya Lagoon Village',
      propertyCode: 'DP000003',
      propertyType: 'HOUSE',
      address: '29/15 Moo 12, Thepprasit Road, Jomtien, Pattaya, Chonburi',
      searchAddress: 'Pattaya Lagoon Village Thepprasit Jomtien Pattaya Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.8984,
      longitude: 100.8882,
      area: 200,
      usableArea: 180,
      landSizeRai: 0,
      landSizeNgan: 0,
      landSizeSqWah: 80,
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2015,
      communityFee: 1500,
      description: JSON.stringify({
        th: 'บ้านชั้นเดียว 3 ห้องนอน 2 ห้องน้ำ ในโครงการ Pattaya Lagoon Village ใกล้หาดจอมเทียน',
        en: 'Single-story house with 3 bedrooms, 2 bathrooms in Pattaya Lagoon Village project, near Jomtien Beach',
        zh: 'Pattaya Lagoon Village项目中的单层住宅，设有3间卧室和2间浴室，靠近宗滴恩海滩',
        ru: 'Одноэтажный дом с 3 спальнями и 2 ванными комнатами в проекте Pattaya Lagoon Village, рядом с пляжем Джомтьен'
      }),
      userId: agent.id
    },
    {
      projectName: 'Siam Royal View',
      propertyCode: 'DP000004',
      propertyType: 'HOUSE',
      address: '68/22 Moo 5, Na Jomtien, Sattahip, Chonburi',
      searchAddress: 'Siam Royal View Na Jomtien Sattahip Chonburi',
      district: 'Sattahip',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20250',
      latitude: 12.8401,
      longitude: 100.9012,
      area: 400,
      usableArea: 350,
      landSizeRai: 0,
      landSizeNgan: 2,
      landSizeSqWah: 0,
      bedrooms: 5,
      bathrooms: 4,
      floors: 2,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2020,
      communityFee: 5000,
      description: JSON.stringify({
        th: 'บ้านเดี่ยว 2 ชั้น 5 ห้องนอน 4 ห้องน้ำ ในโครงการ Siam Royal View นาจอมเทียน พร้อมสระว่ายน้ำส่วนตัว วิวทะเล',
        en: 'Two-story single house with 5 bedrooms, 4 bathrooms in Siam Royal View Na Jomtien project with private pool, sea view',
        zh: 'Siam Royal View那宗滴恩项目中的双层独立式住宅，设有5间卧室和4间浴室，带私人泳池，海景',
        ru: 'Двухэтажный отдельный дом с 5 спальнями и 4 ванными комнатами в проекте Siam Royal View Na Jomtien с частным бассейном, видом на море'
      }),
      userId: agent.id
    },
    {
      projectName: 'Palm Oasis Village',
      propertyCode: 'DP000005',
      propertyType: 'HOUSE',
      address: '88/123 Moo 10, Nongprue, Banglamung, Chonburi',
      searchAddress: 'Palm Oasis Village Nongprue Banglamung Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9432,
      longitude: 100.9142,
      area: 320,
      usableArea: 280,
      landSizeRai: 0,
      landSizeNgan: 1,
      landSizeSqWah: 20,
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      furnishing: 'PARTIALLY_FURNISHED',
      constructionYear: 2017,
      communityFee: 2500,
      description: JSON.stringify({
        th: 'บ้านเดี่ยว 2 ชั้น 4 ห้องนอน 3 ห้องน้ำ ในโครงการ Palm Oasis Village พัทยา ใกล้ห้างสรรพสินค้า',
        en: 'Two-story single house with 4 bedrooms, 3 bathrooms in Palm Oasis Village Pattaya project, near shopping mall',
        zh: 'Palm Oasis Village芭堤雅项目中的双层独立式住宅，设有4间卧室和3间浴室，靠近购物中心',
        ru: 'Двухэтажный отдельный дом с 4 спальнями и 3 ванными комнатами в проекте Palm Oasis Village Pattaya, рядом с торговым центром'
      }),
      userId: agent.id
    }
  ];

  // สร้างข้อมูลโรงแรมในพัทยา 5 ชุด
  const hotels = [
    {
      projectName: 'Hilton Pattaya',
      propertyCode: 'DP000006',
      propertyType: 'HOTEL',
      address: '333/101 Moo 9, Pattaya Beach Road, Nongprue, Banglamung, Chonburi',
      searchAddress: 'Hilton Pattaya Beach Road Nongprue Banglamung Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9477,
      longitude: 100.8825,
      area: 10000,
      usableArea: 9000,
      bedrooms: 50,
      bathrooms: 50,
      floors: 15,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2010,
      description: JSON.stringify({
        th: 'โรงแรมหรู 5 ดาว Hilton Pattaya ตั้งอยู่บนถนนพัทยาสายหลัก วิวทะเลสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน',
        en: 'Luxury 5-star Hilton Pattaya hotel located on Pattaya Beach Road with beautiful sea view and full amenities',
        zh: '位于芭堤雅海滩路的豪华五星级希尔顿酒店，拥有美丽的海景和完善的设施',
        ru: 'Роскошный 5-звездочный отель Hilton Pattaya, расположенный на Бич-роуд в Паттайе, с прекрасным видом на море и полным набором удобств'
      }),
      userId: agent.id
    },
    {
      projectName: 'Dusit Thani Pattaya',
      propertyCode: 'DP000007',
      propertyType: 'HOTEL',
      address: '240/2 Pattaya Beach Road, Nongprue, Banglamung, Chonburi',
      searchAddress: 'Dusit Thani Pattaya Beach Road Nongprue Banglamung Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9673,
      longitude: 100.8845,
      area: 12000,
      usableArea: 10000,
      bedrooms: 60,
      bathrooms: 60,
      floors: 8,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 1995,
      description: JSON.stringify({
        th: 'โรงแรมหรู Dusit Thani Pattaya ตั้งอยู่บนถนนพัทยาสายหลัก วิวทะเลสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน',
        en: 'Luxury Dusit Thani Pattaya hotel located on Pattaya Beach Road with beautiful sea view and full amenities',
        zh: '位于芭堤雅海滩路的豪华杜斯特塔尼酒店，拥有美丽的海景和完善的设施',
        ru: 'Роскошный отель Dusit Thani Pattaya, расположенный на Бич-роуд в Паттайе, с прекрасным видом на море и полным набором удобств'
      }),
      userId: agent.id
    },
    {
      projectName: 'Holiday Inn Pattaya',
      propertyCode: 'DP000008',
      propertyType: 'HOTEL',
      address: '463/68, 463/99 Pattaya Sai 1 Road, Nongprue, Banglamung, Chonburi',
      searchAddress: 'Holiday Inn Pattaya Sai 1 Road Nongprue Banglamung Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9508,
      longitude: 100.8830,
      area: 8000,
      usableArea: 7000,
      bedrooms: 40,
      bathrooms: 40,
      floors: 10,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2012,
      description: JSON.stringify({
        th: 'โรงแรม Holiday Inn Pattaya ตั้งอยู่บนถนนพัทยาสาย 1 วิวทะเลสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน',
        en: 'Holiday Inn Pattaya hotel located on Pattaya Sai 1 Road with beautiful sea view and full amenities',
        zh: '位于芭堤雅一路的假日酒店，拥有美丽的海景和完善的设施',
        ru: 'Отель Holiday Inn Pattaya, расположенный на дороге Паттайя Сай 1, с прекрасным видом на море и полным набором удобств'
      }),
      userId: agent.id
    },
    {
      projectName: 'Amari Ocean Pattaya',
      propertyCode: 'DP000009',
      propertyType: 'HOTEL',
      address: '240 Moo 5, Pattaya-Naklua Road, Naklua, Banglamung, Chonburi',
      searchAddress: 'Amari Ocean Pattaya Naklua Road Naklua Banglamung Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9762,
      longitude: 100.8876,
      area: 9000,
      usableArea: 8000,
      bedrooms: 45,
      bathrooms: 45,
      floors: 12,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 2008,
      description: JSON.stringify({
        th: 'โรงแรม Amari Ocean Pattaya ตั้งอยู่บนถนนพัทยา-นาเกลือ วิวทะเลสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน',
        en: 'Amari Ocean Pattaya hotel located on Pattaya-Naklua Road with beautiful sea view and full amenities',
        zh: '位于芭堤雅-纳克鲁亚路的阿玛瑞海洋酒店，拥有美丽的海景和完善的设施',
        ru: 'Отель Amari Ocean Pattaya, расположенный на дороге Паттайя-Наклуа, с прекрасным видом на море и полным набором удобств'
      }),
      userId: agent.id
    },
    {
      projectName: 'Royal Cliff Beach Hotel',
      propertyCode: 'DP000010',
      propertyType: 'HOTEL',
      address: '353 Phra Tamnuk Road, Pattaya, Chonburi',
      searchAddress: 'Royal Cliff Beach Hotel Phra Tamnuk Road Pattaya Chonburi',
      district: 'Banglamung',
      province: 'Chonburi',
      city: 'Pattaya',
      zipCode: '20150',
      latitude: 12.9217,
      longitude: 100.8602,
      area: 15000,
      usableArea: 13000,
      bedrooms: 70,
      bathrooms: 70,
      floors: 10,
      furnishing: 'FULLY_FURNISHED',
      constructionYear: 1990,
      description: JSON.stringify({
        th: 'โรงแรมหรู Royal Cliff Beach Hotel ตั้งอยู่บนถนนพระตำหนัก พัทยา วิวทะเลสวยงาม พร้อมสิ่งอำนวยความสะดวกครบครัน',
        en: 'Luxury Royal Cliff Beach Hotel located on Phra Tamnuk Road, Pattaya with beautiful sea view and full amenities',
        zh: '位于芭堤雅帕塔姆纳克路的豪华皇家悬崖海滩酒店，拥有美丽的海景和完善的设施',
        ru: 'Роскошный отель Royal Cliff Beach, расположенный на дороге Пра Тамнук в Паттайе, с прекрасным видом на море и полным набором удобств'
      }),
      userId: agent.id
    }
  ];

  // เพิ่มข้อมูลบ้าน
  for (const house of houses) {
    const property = await prisma.property.upsert({
      where: { propertyCode: house.propertyCode },
      update: house,
      create: house
    });

    // เพิ่มข้อมูลการฝากขาย
    await prisma.propertyListing.create({
      data: {
        listingType: 'SALE',
        status: 'ACTIVE',
        price: Math.floor(Math.random() * 10000000) + 5000000, // สุ่มราคาระหว่าง 5-15 ล้านบาท
        pricePerSqm: Math.floor(Math.random() * 50000) + 50000, // สุ่มราคาต่อตารางเมตร
        currency: 'THB',
        allowCoAgent: true,
        commissionType: 'PERCENT',
        commissionPercent: 3,
        privateNote: 'บ้านสภาพดี ทำเลดี ใกล้ชายหาด',
        useProfileContact: true,
        propertyId: property.id,
        userId: agent.id
      }
    });
    
    // เพิ่มข้อมูลการฝากเช่าสำหรับบ้าน 3 หลังแรก (ให้มีทั้งฝากขายและฝากเช่า)
    if (houses.indexOf(house) < 3) {
      await prisma.propertyListing.create({
        data: {
          listingType: 'RENT',
          status: 'ACTIVE',
          price: Math.floor(Math.random() * 50000) + 30000, // สุ่มราคาเช่าระหว่าง 30,000-80,000 บาท/เดือน
          currency: 'THB',
          allowCoAgent: true,
          commissionType: 'PERCENT',
          commissionPercent: 5,
          minimumStay: 6, // ระยะเวลาขั้นต่ำในการเช่า 6 เดือน
          privateNote: 'บ้านสภาพดี เหมาะสำหรับเช่าระยะยาว',
          useProfileContact: true,
          propertyId: property.id,
          userId: agent.id
        }
      });
    }

    // เพิ่มรูปภาพ
    await prisma.propertyImage.create({
      data: {
        url: `https://example.com/images/houses/${property.id}/1.jpg`,
        isFeatured: true,
        propertyId: property.id
      }
    });

    // เพิ่ม highlights
    await prisma.propertyHighlight.create({
      data: {
        highlightType: 'BRAND_NEW_PROPERTY',
        propertyId: property.id
      }
    });

    // เพิ่ม nearby places
    await prisma.propertyNearby.create({
      data: {
        nearbyType: 'NEAR_BEACH',
        distance: 0.5,
        propertyId: property.id
      }
    });
  }

  // เพิ่มข้อมูลโรงแรม
  for (const hotel of hotels) {
    const property = await prisma.property.upsert({
      where: { propertyCode: hotel.propertyCode },
      update: hotel,
      create: hotel
    });

    // เพิ่มข้อมูลการฝากขาย
    await prisma.propertyListing.create({
      data: {
        listingType: 'SALE',
        status: 'ACTIVE',
        price: Math.floor(Math.random() * 100000000) + 50000000, // สุ่มราคาระหว่าง 50-150 ล้านบาท
        pricePerSqm: Math.floor(Math.random() * 50000) + 100000, // สุ่มราคาต่อตารางเมตร
        currency: 'THB',
        allowCoAgent: true,
        commissionType: 'PERCENT',
        commissionPercent: 3,
        privateNote: 'โรงแรมทำเลดี ใกล้ชายหาด ธุรกิจดำเนินการอยู่',
        useProfileContact: true,
        propertyId: property.id,
        userId: agent.id
      }
    });
    
    // เพิ่มข้อมูลการฝากเช่าสำหรับโรงแรม 2 แห่งแรก (ให้มีทั้งฝากขายและฝากเช่า)
    if (hotels.indexOf(hotel) < 2) {
      await prisma.propertyListing.create({
        data: {
          listingType: 'RENT',
          status: 'ACTIVE',
          price: Math.floor(Math.random() * 1000000) + 500000, // สุ่มราคาเช่าระหว่าง 500,000-1,500,000 บาท/เดือน
          currency: 'THB',
          allowCoAgent: true,
          commissionType: 'PERCENT',
          commissionPercent: 5,
          minimumStay: 12, // ระยะเวลาขั้นต่ำในการเช่า 12 เดือน
          privateNote: 'โรงแรมดำเนินการอยู่ เหมาะสำหรับเช่าระยะยาว',
          useProfileContact: true,
          propertyId: property.id,
          userId: agent.id
        }
      });
    }

    // เพิ่มรูปภาพ
    await prisma.propertyImage.create({
      data: {
        url: `https://example.com/images/hotels/${property.id}/1.jpg`,
        isFeatured: true,
        propertyId: property.id
      }
    });

    // เพิ่ม amenities
    await prisma.propertyAmenity.create({
      data: {
        amenityType: 'AIR_CONDITIONER',
        propertyId: property.id
      }
    });

    // เพิ่ม facilities
    await prisma.propertyFacility.create({
      data: {
        facilityType: 'SWIMMING_POOL',
        facilityCategory: 'POOLS_SPA_RELAXATION',
        propertyId: property.id
      }
    });

    // เพิ่ม views
    await prisma.propertyView.create({
      data: {
        viewType: 'SEA_VIEW',
        propertyId: property.id
      }
    });
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
