#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');

console.log('Starting database migration and seeding process...');

try {
  // Step 1: Run Prisma migrations
  console.log('\n📊 Running Prisma migrations...');
  execSync('npx prisma migrate dev --name add_language_models', { 
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // Step 2: Run the home translations seed script
  console.log('\n🌐 Seeding home translations...');
  execSync('node ./prisma/seed-home-translations.js', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Migration and seeding completed successfully!');
  console.log('   New models: UiString, MenuItem');
  console.log('   Seeded: Home section translations (4 languages)');
  
} catch (error) {
  console.error('\n❌ Error during migration or seeding:', error.message);
  process.exit(1);
}
