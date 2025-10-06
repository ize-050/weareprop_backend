const fs = require('fs');
const csv = require('csv-parser');

// Path to the CSV file
const csvFilePath = '/Users/ize/freelance/readme/Slug_Website translation 4 Languages - listing.csv';

// Function to generate SQL statements for import
async function generateImportSQL() {
  try {
    console.log('🚀 Starting generation of import SQL statements...');
    
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
            
            const sqlStatements = [];
            
            for (const row of results) {
              // Process first set of translations (Overview section)
              if (row.english && row.english.trim()) {
                const slug = row.english.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                  .replace(/\s+/g, '-') // Replace spaces with hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .trim();
                
                if (slug && slug.length > 0) {
                  const englishText = row.english.trim().replace(/'/g, "''");
                  const thaiText = (row.thai ? row.thai.trim() : englishText).replace(/'/g, "''");
                  const chineseText = (row.chinese ? row.chinese.trim() : englishText).replace(/'/g, "''");
                  const russianText = (row.russian ? row.russian.trim() : englishText).replace(/'/g, "''");
                  
                  sqlStatements.push({
                    section: 'listing',
                    slug: slug,
                    en: englishText,
                    th: thaiText,
                    zhCN: chineseText,
                    ru: russianText
                  });
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
                  const englishText2 = row.english2.trim().replace(/'/g, "''");
                  const thaiText2 = (row.thai2 ? row.thai2.trim() : englishText2).replace(/'/g, "''");
                  const chineseText2 = (row.chinese2 ? row.chinese2.trim() : englishText2).replace(/'/g, "''");
                  const russianText2 = (row.russian2 ? row.russian2.trim() : englishText2).replace(/'/g, "''");
                  
                  sqlStatements.push({
                    section: 'listing',
                    slug: slug2,
                    en: englishText2,
                    th: thaiText2,
                    zhCN: chineseText2,
                    ru: russianText2
                  });
                }
              }
            }
            
            console.log(`📝 Generated ${sqlStatements.length} SQL statements`);
            resolve(sqlStatements);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('💥 Generation failed:', error);
    throw error;
  }
}

// Run the generation
if (require.main === module) {
  generateImportSQL()
    .then((statements) => {
      console.log('✨ Generated statements:');
      statements.forEach((stmt, index) => {
        console.log(`${index + 1}. ${stmt.slug} -> ${stmt.en}`);
      });
      
      // Write to file for manual execution
      const sqlFile = statements.map(stmt => 
        `INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) VALUES ('${stmt.section}', '${stmt.slug}', '${stmt.en}', '${stmt.th}', '${stmt.zhCN}', '${stmt.ru}', NOW(), NOW()) ON DUPLICATE KEY UPDATE en='${stmt.en}', th='${stmt.th}', zhCN='${stmt.zhCN}', ru='${stmt.ru}', updated_at=NOW();`
      ).join('\n');
      
      fs.writeFileSync('/Users/ize/freelance/backendDD_property/scripts/import-translations.sql', sqlFile);
      console.log('📄 SQL file written to: scripts/import-translations.sql');
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateImportSQL };
