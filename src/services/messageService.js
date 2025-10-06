const messageRepository = require('../repositories/messageRepository');
const emailService = require('./emailService');
const propertyService = require('./propertyService');
const { BadRequestError } = require('../utils/errors');

class MessageService {
  async createMessage(messageData) {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!messageData.name || !messageData.phone || !messageData.propertyId) {
      throw new BadRequestError('Name, phone and propertyId are required');
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (เบอร์ไทย)
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(messageData.phone)) {
      throw new BadRequestError('Invalid phone number format');
    }

    try {
      // ดึงข้อมูล property พร้อม agent ก่อนบันทึก message
      const propertyWithAgent = await messageRepository.getPropertyWithAgent(messageData.propertyId);
      
      if (!propertyWithAgent) {
        throw new BadRequestError('Property not found');
      }

      const result = await messageRepository.createMessage(messageData);
    
    // อัปเดต interested_count ของ property
    try {
      await propertyService.incrementInterestedCount(messageData.propertyId);
      console.log(`Interested count incremented for property ID: ${messageData.propertyId}`);
    } catch (countError) {
      console.error('Failed to increment interested count:', countError);
      // ไม่ throw error เพื่อไม่ให้การอัปเดต count ล้มเหลวส่งผลต่อการบันทึก message
    }
    
    // ส่งอีเมลแจ้งเตือนไปยัง agent ของทรัพย์สิน
      try {
        const agentName = propertyWithAgent.user.name || 
                         `${propertyWithAgent.user.firstname || ''} ${propertyWithAgent.user.lastname || ''}`.trim() || 
                         'Agent';
        
        const propertyTitle = `${propertyWithAgent.title} (${propertyWithAgent.propertyType?.name || 'Property'})`;
        
        await emailService.sendPropertyInquiryEmail({
          propertyId: messageData.propertyId,
          propertyTitle: propertyTitle,
          customerName: messageData.name,
          customerEmail: messageData.email || 'Not provided',
          customerPhone: messageData.phone,
          message: messageData.message,
          agentEmail: propertyWithAgent.user.email, // ส่งไปยังอีเมลของ agent
          agentName: agentName
        });
        console.log(`Message notification email sent to agent: ${propertyWithAgent.user.email}`);
      } catch (emailError) {
        console.error('Failed to send message notification email:', emailError);
        // ไม่ throw error เพื่อไม่ให้การส่งอีเมลล้มเหลวส่งผลต่อการบันทึกข้อมูล
      }
      
      return result;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesByPropertyId(propertyId) {
    if (!propertyId) {
      throw new BadRequestError('PropertyId is required');
    }

    return messageRepository.getMessagesByPropertyId(propertyId);
  }

  async getAllMessages(page = 1, limit = 20, userId
    
  ) {

    const role = await messageRepository.getRole(userId);


    if(role?.role === 'ADMIN') {
      return messageRepository.getAllMessages(page, limit);
    }
    if(role?.role === 'USER') {
      return messageRepository.getMessagesByUserId(userId, page, limit);
    }
  }

  async updateMessageStatus(id, status) {
    if (!id || !status) {
      throw new BadRequestError('Message ID and status are required');
    }

    const validStatuses = ['NEW', 'CONTACTED', 'VISIT', 'PROPOSAL', 'WON', 'LOST'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status. Must be one of: NEW, CONTACTED, VISIT, PROPOSAL, WON, LOST');
    }

    return messageRepository.updateMessageStatus(id, status);
  }

  async getMessagesByUserId(userId, page = 1, limit = 20) {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    return messageRepository.getMessagesByUserId(userId, page, limit);
  }


  async getPropertyByMessage(userId) {
    try{
        return messageRepository.getPropertyByMessage(userId);
    }
    catch(error){
      throw error;
    }
  }
}

module.exports = new MessageService();
