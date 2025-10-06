const messageService = require('../services/messageService');
const { handleError } = require('../utils/errorHandler');

class MessageController {
  async createMessage(req, res) {
    try {
      const messageData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message || '',
        propertyId: parseInt(req.body.propertyId)
      };

      const result = await messageService.createMessage(messageData);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      return handleError(error, res);

    }
  }
    async  getMessagesByPropertyId(req, res) {
      try {
        const { propertyId } = req.params;
        const messages = await messageService.getMessagesByPropertyId(propertyId);

        return res.status(200).json({
          success: true,
          data: messages
        });
      } catch (error) {
        return handleError(error, res);
      }
    }


  async getAllMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const userId = req.user.userId;

      
      const result = await messageService.getAllMessages(page, limit, userId);
      
      return res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async updateMessageStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          error: 'Message ID and status are required'
        });
      }

      const updatedMessage = await messageService.updateMessageStatus(id, status);
      
      return res.status(200).json({
        success: true,
        data: updatedMessage
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async getMessagesByUser(req, res) {
    try {
      const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({
            success: false,
            error: 'User ID is required'
            });
        }
      
      // Get pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      // Get messages for this user's properties
      const result = await messageService.getMessagesByUserId(userId, page, limit);
      
      return res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async getPropertyByMessage(req, res) {
    try {

      const userId = req.user.userId;
      
      const result = await messageService.getPropertyByMessage(userId);
      console.log("result",result);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

module.exports = new MessageController();
