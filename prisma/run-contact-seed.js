// Script to run the contact translations seed
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Contact section translations seeding process...');

try {
  // Run the seed script
  console.log('Running seed-contact-translations.js...');
  execSync('node prisma/seed-contact-translations.js', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('✅ Contact section translations seeded successfully!');
} catch (error) {
  console.error('❌ Error seeding Contact section translations:', error.message);
  process.exit(1);
}
