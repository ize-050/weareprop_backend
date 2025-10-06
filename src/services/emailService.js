const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } catch (error) {
      console.error('Error initializing email transporter:', error);
    }
  }

  async getAdminEmail() {
    try {
      const emailSetting = await prisma.messagingSettings.findFirst({
        where: {
          platform: 'email',
          isEnabled: true
        }
      });
      
      return emailSetting?.platformValue || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    } catch (error) {
      console.error('Error fetching admin email from settings:', error);
      return process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendEmail({ to, cc, bcc, subject, html, text, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // เพิ่ม D-Luck icon เป็น attachment
      const iconPath = path.join(__dirname, '../../public/images/icon.png');
      const defaultAttachments = [];
      
      if (fs.existsSync(iconPath)) {
        defaultAttachments.push({
          filename: 'dluck-icon.png',
          path: iconPath,
          cid: 'dluck-icon' // Content-ID สำหรับใช้ใน HTML
        });
      }

      const mailOptions = {
        from: `"D-Luck Property" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
        attachments: [...defaultAttachments, ...attachments]
      };

      // เพิ่ม CC และ BCC ถ้ามี
      if (cc) {
        mailOptions.cc = cc;
      }
      if (bcc) {
        mailOptions.bcc = bcc;
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendContactFormEmail({ name, email, phone, subject, message }) {
    const emailSubject = `Contact Form: ${subject || 'New Inquiry'}`;
    
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <!-- Header with Logo -->
        <div style="background: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 2px solid #f3f4f6;">
          <div style="margin-bottom: 20px;">
            <img src="cid:dluck-icon" alt="D-Luck Property" style="width: 60px; height: 60px; object-fit: contain;" />
          </div>
          <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">D-Luck Property</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">Contact Form Submission</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <!-- Contact Information -->
          <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Contact Information</h2>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280; width: 100px;">Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone || 'Not provided'}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">Subject:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 400;">${subject || 'General Inquiry'}</td>
              </tr>
            </table>
          </div>
          
          <!-- Message -->
          <h3 style="color: #374151; margin: 25px 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Message</h3>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 14px;">${message}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <div style="margin-bottom: 12px;">
            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
              This message was sent from <strong style="color: #374151;">D-Luck Property</strong> contact form<br>
              Received: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
            </p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
              © 2025 D-Luck Property. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const textVersion = `
      D-Luck Property - New Contact Form Submission
      
      Contact Information:
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Subject: ${subject || 'General Inquiry'}
      
      Message:
      ${message}
      
      Time: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
    `;

    // ดึงข้อมูล admin email จาก messaging_settings
    const adminEmail = await this.getAdminEmail();
    
    return await this.sendEmail({
      to: adminEmail,
      cc: 'supakorn@d-luckproperty.com', // CC ไปที่ supakorn เสมอ
      subject: emailSubject,
      html,
      text: textVersion
    });
  }

  async sendPropertyInquiryEmail({ 
    propertyId, 
    propertyTitle, 
    customerName, 
    customerEmail, 
    customerPhone, 
    message
  }) {
    // ดึงข้อมูล property และเจ้าของ property จาก database
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        user: true // ดึงข้อมูลเจ้าของ property
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const agentEmail = property.user?.email;
    const agentName = property.user?.name || 'Agent';
    const property_code = property.propertyCode;

    if (!agentEmail) {
      throw new Error('Property owner email not found');
    }
    const emailSubject = `Property Inquiry: ${propertyTitle}`;
    
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <!-- Header with Logo -->
        <div style="background: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 2px solid #f3f4f6;">
          <div style="margin-bottom: 20px;">
            <img src="cid:dluck-icon" alt="D-Luck Property" style="width: 60px; height: 60px; object-fit: contain;" />
          </div>
          <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">D-Luck Property</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">Property Inquiry Notification</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <!-- Agent Greeting -->
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #374151; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">เรียน คุณ${agentName}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">มีลูกค้าสนใจทรัพย์สินของท่านและต้องการติดต่อ กรุณาตรวจสอบรายละเอียดและติดต่อกลับโดยเร็วที่สุด</p>
          </div>
          <!-- Property Information -->
          <h3 style="color: #374151; margin: 25px 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ข้อมูลทรัพย์สิน</h3>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280; width: 120px;">รหัสทรัพย์สิน:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 500;">${property_code}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">ชื่อทรัพย์สิน:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 400;">${propertyTitle}</td>
              </tr>
            </table>
          </div>
          
          <!-- Customer Information -->
          <h3 style="color: #374151; margin: 25px 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ข้อมูลลูกค้า</h3>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280; width: 120px;">ชื่อ:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 500;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 500; color: #6b7280;">อีเมล:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #374151;"><a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #6b7280;">เบอร์โทรศัพท์:</td>
                <td style="padding: 8px 0; color: #374151;"><a href="tel:${customerPhone}" style="color: #2563eb; text-decoration: none;">${customerPhone}</a></td>
              </tr>
            </table>
          </div>
          
          <!-- Customer Message -->
          <h3 style="color: #374151; margin: 25px 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">ข้อความจากลูกค้า</h3>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 14px;">${message}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <div style="margin-bottom: 12px;">
            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
              ข้อความสอบถามนี้ได้รับจากเว็บไซต์ <strong style="color: #374151;">D-Luck Property</strong><br>
              เวลาที่ได้รับ: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
            </p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
              © 2025 D-Luck Property. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const textVersion = `
      D-Luck Property - New Property Inquiry
      
      สวัสดีคุณ ${agentName}
      มีลูกค้าสนใจทรัพย์สินของคุณและต้องการติดต่อ กรุณาตรวจสอบรายละเอียดด้านล่างและติดต่อกลับโดยเร็วที่สุด
      
      Property Information:
      Property ID: ${propertyId}
      Property Title: ${propertyTitle}
      
      Customer Information:
      Name: ${customerName}
      Email: ${customerEmail}
      Phone: ${customerPhone}
      
      Message:
      ${message}
      
      Time: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
    `;

    return await this.sendEmail({
      to: agentEmail, // ส่งไปหาเจ้าของ property
      cc: 'supakorn@d-luckproperty.com', // CC ไปที่ supakorn เสมอ
      subject: emailSubject,
      html,
      text: textVersion
    });
  }
}

module.exports = new EmailService();
