const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@dluckproperty.com' }
    });

    if (existingUser) {
      // Update existing admin user password
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@dluckproperty.com' },
        data: {
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user password updated successfully!');
      console.log('📧 Email: admin@dluckproperty.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: ADMIN');
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@dluckproperty.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@dluckproperty.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: ADMIN');
    }
    
  } catch (error) {
    console.error('❌ Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
