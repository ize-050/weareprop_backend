const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageRepository {
  async createMessage(messageData) {
    return prisma.message.create({
      data: {
        name: messageData.name,
        email: messageData.email, // เพิ่ม email field
        phone: messageData.phone,
        message: messageData.message,
        propertyId: messageData.propertyId,
      }
    });
  }

  async getPropertyWithAgent(propertyId) {
    return prisma.property.findUnique({
      where: {
        id: parseInt(propertyId)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstname: true,
            lastname: true
          }
        },
        propertyType: {
          select: {
            name: true
          }
        }
      }
    });
  }

  async getMessagesByPropertyId(propertyId) {
    return prisma.message.findMany({
      where: {
        propertyId: parseInt(propertyId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getAllMessages(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          property: {
            select: {
              id: true,
              projectName: true,
              propertyType: true,
              district: true,
              images: true
            },
          }
        }
      }),
      prisma.message.count()
    ]);




    return {
      messages,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  }

  async updateMessageStatus(id, status) {
    return prisma.message.update({
      where: { id: parseInt(id) },
      data: { status }
    });
  }

  async getMessagesByUserId(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    // First get all properties that belong to this user
    const userProperties = await prisma.property.findMany({
      where: { userId: parseInt(userId) },
      select: { id: true }
    });
    
    // Extract property IDs
    const propertyIds = userProperties.map(prop => prop.id);
    
    // Get messages for these properties with pagination
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: {
          propertyId: { in: propertyIds }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          property: {
            select: {
              id: true,
              projectName: true,
              propertyType: true,
              district: true,
              images: true
            },
          }
        }
      }),
      prisma.message.count({
        where: {
          propertyId: { in: propertyIds }
        }
      })
    ]);

    return {
      messages,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  }

  async getRole(userId) {
    return prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });
  }

  async getPropertyByMessage(userId) {
    try{
      
      const role = await this.getRole(userId);
      if(role.role === 'ADMIN') {
        return prisma.property.findMany({
          select: {
            id: true,
            projectName: true,
            propertyType: true,
            district: true
          }
        }); 
      }
      if(role.role === 'USER') {
        return prisma.property.findMany({
          where: { userId: parseInt(userId) },
          select: {
            id: true,
            projectName: true,
            propertyType: true,
            district: true
          }
        });
      }
    }
    catch(error){
      throw error;
    }
  }
}

module.exports = new MessageRepository();
