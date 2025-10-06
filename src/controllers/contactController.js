const contactService = require('../services/contactService');
const { handleError } = require('../utils/errorHandler');

class ContactController {
  async createContact(req, res) {
    try {
      const contactData = {
        name: req.body.name,
        phone: req.body.phone,
        message: req.body.message || '',
        propertyId: parseInt(req.body.propertyId)
      };

      const result = await contactService.createContact(contactData);
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async getContactsByPropertyId(req, res) {
    try {
      const { propertyId } = req.params;
      const contacts = await contactService.getContactsByPropertyId(propertyId);
      
      return res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  async getAllContacts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await contactService.getAllContacts(page, limit);
      
      return res.status(200).json({
        success: true,
        data: result.contacts,
        pagination: result.pagination
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

module.exports = new ContactController();
