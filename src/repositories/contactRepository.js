const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ContactRepository {
  async createContact(contactData) {
    return prisma.contact.create({
      data: {
        name: contactData.name,
        phone: contactData.phone,
        message: contactData.message,
        propertyId: contactData.propertyId,
      }
    });
  }

  async getContactsByPropertyId(propertyId) {
    return prisma.contact.findMany({
      where: {
        propertyId: parseInt(propertyId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getAllContacts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          property: {
            select: {
              projectName: true,
              propertyType: true
            }
          }
        }
      }),
      prisma.contact.count()
    ]);

    return {
      contacts,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  }
}

module.exports = new ContactRepository();
