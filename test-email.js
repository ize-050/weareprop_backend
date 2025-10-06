// Test script for email service
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Verify email connection
  console.log('1. Testing email connection...');
  const connectionResult = await emailService.verifyConnection();
  if (connectionResult) {
    console.log('✅ Email connection verified successfully\n');
  } else {
    console.log('❌ Email connection failed\n');
    return;
  }

  // Test 2: Send contact form email
  console.log('2. Testing contact form email...');
  try {
    const contactResult = await emailService.sendContactFormEmail({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+66 89 123 4567',
      subject: 'Test Contact Form',
      message: 'This is a test message from the contact form.'
    });
    console.log('✅ Contact form email sent successfully:', contactResult.messageId);
  } catch (error) {
    console.log('❌ Contact form email failed:', error.message);
  }

  console.log('\n3. Testing property inquiry email...');
  try {
    const inquiryResult = await emailService.sendPropertyInquiryEmail({
      propertyId: 123,
      propertyTitle: 'Test Property - Beautiful Condo',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+66 89 999 8888',
      message: 'I am interested in this property. Please contact me.',
      agentEmail: null
    });
    console.log('✅ Property inquiry email sent successfully:', inquiryResult.messageId);
  } catch (error) {
    console.log('❌ Property inquiry email failed:', error.message);
  }

  console.log('\n🎉 Email service testing completed!');
}

// Run the test
testEmailService().catch(console.error);
