// ทดสอบการส่งอีเมลพร้อม CC
const emailService = require('./src/services/emailService');

async function testEmailWithCC() {
  try {
    console.log('Testing email with CC functionality...');
    
    // ทดสอบการส่งอีเมลธรรมดาพร้อม CC
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      cc: 'supakorn@d-luckproperty.com',
      subject: 'Test Email with CC',
      html: '<h1>Test Email</h1><p>This is a test email to verify CC functionality.</p>',
      text: 'Test Email - This is a test email to verify CC functionality.'
    });
    
    console.log('Email sent successfully:', result);
    
    // ทดสอบการส่งอีเมล Contact Form
    console.log('\nTesting Contact Form email...');
    const contactResult = await emailService.sendContactFormEmail({
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '0123456789',
      subject: 'Test Contact Form',
      message: 'This is a test message from contact form.'
    });
    
    console.log('Contact form email sent successfully:', contactResult);
    
    // ทดสอบการส่งอีเมล Property Inquiry
    console.log('\nTesting Property Inquiry email...');
    const inquiryResult = await emailService.sendPropertyInquiryEmail({
      propertyId: 'TEST123',
      propertyTitle: 'Test Property',
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '0987654321',
      message: 'I am interested in this property.'
    });
    
    console.log('Property inquiry email sent successfully:', inquiryResult);
    
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

// เรียกใช้ฟังก์ชันทดสอบ
testEmailWithCC();
