const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ddproperty_db',
  port: process.env.DB_PORT || 8889
};

// Path to the CSV file
const csvFilePath = '/Users/ize/freelance/readme/Slug_Website translation 4 Languages - listing.csv';

async function importListingTranslations() {
  let connection;
  
  try {
    console.log('🚀 Starting import of listing translations...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
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
              !data.english.startsWith('-') &&
              data.english.trim() !== '') {
            results.push(data);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Found ${results.length} translation entries to process`);
            
            let importedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            
            for (const row of results) {
              // Process first set of translations (Overview section)
              if (row.english && row.english.trim()) {
                const slug = row.english.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .trim();
                
                if (slug && slug.length > 0) {
                  try {
                    const englishText = row.english.trim();
                    const thaiText = row.thai ? row.thai.trim() : englishText;
                    const chineseText = row.chinese ? row.chinese.trim() : englishText;
                    const russianText = row.russian ? row.russian.trim() : englishText;
                    
                    // Check if record exists
                    const [existingRows] = await connection.execute(
                      'SELECT id FROM ui_string WHERE section = ? AND slug = ?',
                      ['listing', slug]
                    );
                    
                    if (existingRows.length > 0) {
                      // Update existing record
                      await connection.execute(
                        'UPDATE ui_string SET en = ?, th = ?, zhCN = ?, ru = ?, updated_at = NOW() WHERE section = ? AND slug = ?',
                        [englishText, thaiText, chineseText, russianText, 'listing', slug]
                      );
                      updatedCount++;
                      console.log(`🔄 Updated: ${slug} -> ${englishText}`);
                    } else {
                      // Insert new record
                      await connection.execute(
                        'INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                        ['listing', slug, englishText, thaiText, chineseText, russianText]
                      );
                      importedCount++;
                      console.log(`✅ Imported: ${slug} -> ${englishText}`);
                    }
                  } catch (error) {
                    console.error(`❌ Error processing ${slug}:`, error.message);
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
                
                if (slug2 && slug2.length > 0) {
                  try {
                    const englishText2 = row.english2.trim();
                    const thaiText2 = row.thai2 ? row.thai2.trim() : englishText2;
                    const chineseText2 = row.chinese2 ? row.chinese2.trim() : englishText2;
                    const russianText2 = row.russian2 ? row.russian2.trim() : englishText2;
                    
                    // Check if record exists
                    const [existingRows2] = await connection.execute(
                      'SELECT id FROM ui_string WHERE section = ? AND slug = ?',
                      ['listing', slug2]
                    );
                    
                    if (existingRows2.length > 0) {
                      // Update existing record
                      await connection.execute(
                        'UPDATE ui_string SET en = ?, th = ?, zhCN = ?, ru = ?, updated_at = NOW() WHERE section = ? AND slug = ?',
                        [englishText2, thaiText2, chineseText2, russianText2, 'listing', slug2]
                      );
                      updatedCount++;
                      console.log(`🔄 Updated: ${slug2} -> ${englishText2}`);
                    } else {
                      // Insert new record
                      await connection.execute(
                        'INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                        ['listing', slug2, englishText2, thaiText2, chineseText2, russianText2]
                      );
                      importedCount++;
                      console.log(`✅ Imported: ${slug2} -> ${englishText2}`);
                    }
                  } catch (error) {
                    console.error(`❌ Error processing ${slug2}:`, error.message);
                    skippedCount++;
                  }
                }
              }
            }
            
            console.log('\n🎉 Import completed!');
            console.log(`📈 Successfully imported: ${importedCount} new translations`);
            console.log(`🔄 Successfully updated: ${updatedCount} existing translations`);
            console.log(`⚠️  Skipped: ${skippedCount} translations`);
            console.log(`📊 Total processed: ${importedCount + updatedCount} translations`);
            
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
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
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
