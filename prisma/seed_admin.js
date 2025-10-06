const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dluckproperty.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin User'
    },
    create: {
      email: 'admin@dluckproperty.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin User',
      phone: '+66 89 123 4567'
    }
  });

  console.log(`Admin user created/updated: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
