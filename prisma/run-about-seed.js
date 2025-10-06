// Script to run the about translations seed
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting About section translations seeding process...');

try {
  // Run the seed script
  console.log('Running seed-about-translations.js...');
  execSync('node prisma/seed-about-translations.js', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('✅ About section translations seeded successfully!');
} catch (error) {
  console.error('❌ Error seeding About section translations:', error.message);
  process.exit(1);
}
