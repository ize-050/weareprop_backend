const contactRepository = require('../repositories/contactRepository');
const emailService = require('./emailService');
const { PrismaClient } = require('@prisma/client');
const { BadRequestError } = require('../utils/errors');

const prisma = new PrismaClient();

class ContactService {
  async createContact(contactData) {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!contactData.name || !contactData.phone || !contactData.propertyId) {
      throw new BadRequestError('Name, phone and propertyId are required');
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (เบอร์ไทย)
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(contactData.phone)) {
      throw new BadRequestError('Invalid phone number format');
    }

    try {
      const result = await contactRepository.createContact(contactData);
      
      // ดึงข้อมูล property พร้อมกับ user ที่เป็นเจ้าของ
      const property = await prisma.property.findUnique({
        where: { id: contactData.propertyId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              firstname: true,
              lastname: true
            }
          }
        }
      });

      if (!property) {
        console.error(`Property with ID ${contactData.propertyId} not found`);
        return result;
      }

      if (!property.user) {
        console.error(`User not found for property ID ${contactData.propertyId}`);
        return result;
      }

      // ส่งอีเมลแจ้งเตือนไปยัง email ของเจ้าของ property
      try {
        const agentName = property.user.name || 
                         `${property.user.firstname || ''} ${property.user.lastname || ''}`.trim() || 
                         'Agent';
        
        await emailService.sendPropertyInquiryEmail({
          propertyId: contactData.propertyId,
          propertyTitle: property.title,
          customerName: contactData.name,
          customerEmail: contactData.email || 'Not provided',
          customerPhone: contactData.phone,
          message: contactData.message || 'No message provided',
          agentEmail: property.user.email,
          agentName: agentName
        });
        console.log(`Contact notification email sent successfully to ${property.user.email}`);
      } catch (emailError) {
        console.error('Failed to send contact notification email:', emailError);
        // ไม่ throw error เพื่อไม่ให้การส่งอีเมลล้มเหลวส่งผลต่อการบันทึกข้อมูล
      }
      
      return result;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContactsByPropertyId(propertyId) {
    if (!propertyId) {
      throw new BadRequestError('PropertyId is required');
    }

    return contactRepository.getContactsByPropertyId(propertyId);
  }

  async getAllContacts(page = 1, limit = 20) {
    return contactRepository.getAllContacts(page, limit);
  }
}

module.exports = new ContactService();
