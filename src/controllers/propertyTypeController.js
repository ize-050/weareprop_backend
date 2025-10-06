const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงข้อมูลประเภทอสังหาริมทรัพย์ทั้งหมด
const getAllPropertyTypes = async (req, res) => {
  try {
    const propertyTypes = await prisma.typeProperty.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      status: 'success',
      data: propertyTypes,
    });
  } catch (error) {
    console.error('Error fetching property types:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch property types',
      error: error.message,
    });
  }
};

// ดึงข้อมูลประเภทอสังหาริมทรัพย์ตาม ID
const getPropertyTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyType = await prisma.typeProperty.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!propertyType) {
      return res.status(404).json({
        status: 'error',
        message: 'Property type not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: propertyType,
    });
  } catch (error) {
    console.error('Error fetching property type:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch property type',
      error: error.message,
    });
  }
};

module.exports = {
  getAllPropertyTypes,
  getPropertyTypeById,
};
