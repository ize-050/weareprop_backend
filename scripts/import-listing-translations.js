const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Path to the CSV file
const csvFilePath = '/Users/ize/freelance/readme/Slug_Website translation 4 Languages - listing.csv';

async function importListingTranslations() {
  try {
    console.log('🚀 Starting import of listing translations...');
    
    // Read and parse CSV file
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          headers: ['english', 'thai', 'chinese', 'russian', 'english2', 'thai2', 'chinese2', 'russian2'],
          skipEmptyLines: true
        }))
        .on('data', (data) => {
          // Skip header rows and empty rows
          if (data.english && 
              data.english !== 'English' && 
              data.english !== 'หน้า Overview' &&
              data.english !== '*แก้ไขคำผิด' &&
              !data.english.startsWith('-')) {
            results.push(data);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Found ${results.length} translation entries to process`);
            
            let importedCount = 0;
            let skippedCount = 0;
            
            for (const row of results) {
              // Process first set of translations (Overview section)
              if (row.english && row.english.trim()) {
                const slug = row.english.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .trim();
                
                if (slug) {
                  try {
                    // Check if record exists
                    const existing = await prisma.ui_string.findFirst({
                      where: {
                        section: 'listing',
                        slug: slug
                      }
                    });
                    
                    if (existing) {
                      // Update existing record
                      await prisma.ui_string.update({
                        where: { id: existing.id },
                        data: {
                          en: row.english.trim(),
                          th: row.thai ? row.thai.trim() : row.english.trim(),
                          zhCN: row.chinese ? row.chinese.trim() : row.english.trim(),
                          ru: row.russian ? row.russian.trim() : row.english.trim(),
                          updated_at: new Date()
                        }
                      });
                    } else {
                      // Create new record
                      await prisma.ui_string.create({
                        data: {
                          section: 'listing',
                          slug: slug,
                          en: row.english.trim(),
                          th: row.thai ? row.thai.trim() : row.english.trim(),
                          zhCN: row.chinese ? row.chinese.trim() : row.english.trim(),
                          ru: row.russian ? row.russian.trim() : row.english.trim(),
                          created_at: new Date(),
                          updated_at: new Date()
                        }
                      });
                    }
                    
                    importedCount++;
                    console.log(`✅ Imported: ${slug} -> ${row.english}`);
                  } catch (error) {
                    console.error(`❌ Error importing ${slug}:`, error.message);
                    skippedCount++;
                  }
                }
              }
              
              // Process second set of translations (Form section)
              if (row.english2 && row.english2.trim()) {
                const slug2 = row.english2.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .trim();
                
                if (slug2) {
                  try {
                    // Check if record exists
                    const existing2 = await prisma.ui_string.findFirst({
                      where: {
                        section: 'listing',
                        slug: slug2
                      }
                    });
                    
                    if (existing2) {
                      // Update existing record
                      await prisma.ui_string.update({
                        where: { id: existing2.id },
                        data: {
                          en: row.english2.trim(),
                          th: row.thai2 ? row.thai2.trim() : row.english2.trim(),
                          zhCN: row.chinese2 ? row.chinese2.trim() : row.english2.trim(),
                          ru: row.russian2 ? row.russian2.trim() : row.english2.trim(),
                          updated_at: new Date()
                        }
                      });
                    } else {
                      // Create new record
                      await prisma.ui_string.create({
                        data: {
                          section: 'listing',
                          slug: slug2,
                          en: row.english2.trim(),
                          th: row.thai2 ? row.thai2.trim() : row.english2.trim(),
                          zhCN: row.chinese2 ? row.chinese2.trim() : row.english2.trim(),
                          ru: row.russian2 ? row.russian2.trim() : row.english2.trim(),
                          created_at: new Date(),
                          updated_at: new Date()
                        }
                      });
                    }
                    
                    importedCount++;
                    console.log(`✅ Imported: ${slug2} -> ${row.english2}`);
                  } catch (error) {
                    console.error(`❌ Error importing ${slug2}:`, error.message);
                    skippedCount++;
                  }
                }
              }
            }
            
            console.log('\n🎉 Import completed!');
            console.log(`📈 Successfully imported: ${importedCount} translations`);
            console.log(`⚠️  Skipped: ${skippedCount} translations`);
            
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importListingTranslations()
    .then(() => {
      console.log('✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { importListingTranslations };
