const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed property types...');

  // ลบข้อมูลเดิมทั้งหมดก่อน (ถ้าต้องการ)
  // await prisma.typeProperty.deleteMany({});

  const propertyTypes = [
    {
      name: 'Apartment',
      nameEn: 'Apartment',
      nameTh: 'อพาทเม้นท์',
      nameCh: '公寓',
      nameRu: 'Apartment',
      description: 'Apartment units for rent'
    },
    {
      name: 'House',
      nameEn: 'House',
      nameTh: 'บ้าน',
      nameCh: '房子',
      nameRu: 'House',
      description: 'Single family homes'
    },
    {
      name: 'Condo',
      nameEn: 'Condo',
      nameTh: 'คอนโด',
      nameCh: '公寓',
      nameRu: 'Condo',
      description: 'Condominium units'
    },
    {
      name: 'Villa',
      nameEn: 'Villa',
      nameTh: 'วิลล่า',
      nameCh: '别墅',
      nameRu: 'Villa',
      description: 'Luxury villas'
    },
    {
      name: 'Pool Villa',
      nameEn: 'Pool Villa',
      nameTh: 'พูลวิลล่า',
      nameCh: '泳池别墅',
      nameRu: 'Pool Villa',
      description: 'Villas with private pools'
    },
    {
      name: 'Commercial',
      nameEn: 'Commercial',
      nameTh: 'อาคารพาณิชย์',
      nameCh: '店屋',
      nameRu: 'Commercial',
      description: 'Commercial properties'
    },
    {
      name: 'Land',
      nameEn: 'Land',
      nameTh: 'ที่ดิน',
      nameCh: '土地',
      nameRu: 'Land',
      description: 'Land plots'
    },
    {
      name: 'Townhouse',
      nameEn: 'Townhouse',
      nameTh: 'ทาวน์เฮาส์',
      nameCh: '排房',
      nameRu: 'Townhouse',
      description: 'Townhouses'
    },
    {
      name: 'Service Apartment',
      nameEn: 'Service Apartment',
      nameTh: 'เซอร์วิสอพาร์ทเม้นท์',
      nameCh: '服务式公寓',
      nameRu: 'Service Apartment',
      description: 'Serviced apartments'
    },
    {
      name: 'Office',
      nameEn: 'Office',
      nameTh: 'ออฟฟิศ',
      nameCh: '办公室',
      nameRu: 'Office',
      description: 'Office spaces'
    },
    {
      name: 'Warehouse',
      nameEn: 'Warehouse',
      nameTh: 'โกดัง',
      nameCh: '仓库',
      nameRu: 'Warehouse',
      description: 'Warehouse spaces'
    },
    {
      name: 'Hotel',
      nameEn: 'Hotel',
      nameTh: 'โรงแรม',
      nameCh: '酒店',
      nameRu: 'Hotel',
      description: 'Hotels'
    }
  ];

  // สร้างข้อมูลใหม่
  for (const propertyType of propertyTypes) {
    const existingType = await prisma.typeProperty.findUnique({
      where: { name: propertyType.name }
    });

    if (!existingType) {
      await prisma.typeProperty.create({
        data: propertyType
      });
      console.log(`Created property type: ${propertyType.name}`);
    } else {
      console.log(`Property type ${propertyType.name} already exists, skipping...`);
    }
  }

  console.log('Seeding property types completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
