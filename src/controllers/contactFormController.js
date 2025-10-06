const emailService = require('../services/emailService');
const { handleError } = require('../utils/errorHandler');
const { BadRequestError } = require('../utils/errors');

class ContactFormController {
  async submitContactForm(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!name || !email || !message) {
        throw new BadRequestError('Name, email, and message are required');
      }

      // ตรวจสอบรูปแบบอีเมล
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format');
      }

      // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (ถ้ามี)
      if (phone) {
        const phoneRegex = /^[0-9+\-\s()]{9,15}$/;
        if (!phoneRegex.test(phone)) {
          throw new BadRequestError('Invalid phone number format');
        }
      }

      // ส่งอีเมล
      try {
        await emailService.sendContactFormEmail({
          name,
          email,
          phone,
          subject: subject || 'Contact Form Inquiry',
          message
        });

        return res.status(200).json({
          success: true,
          message: 'Contact form submitted successfully. We will get back to you soon!'
        });
      } catch (emailError) {
        console.error('Failed to send contact form email:', emailError);
        throw new Error('Failed to send email. Please try again later.');
      }
    } catch (error) {
      return handleError(error, res);
    }
  }
}

module.exports = new ContactFormController();
