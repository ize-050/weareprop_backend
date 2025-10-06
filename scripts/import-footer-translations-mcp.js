// scripts/import-footer-translations-mcp.js
const fs = require('fs');
const path = require('path');

/**
 * Script to generate SQL statements for importing footer translations
 * Uses MCP MySQL connection for execution
 */

// Path to the CSV file
const csvFilePath = path.join(__dirname, '../../readme/Footer_Website_translation_4_Languages.csv');

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    data.push(row);
  }
  
  return data;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function generateSQLStatements() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const translations = parseCSV(csvContent);
    
    console.log(`📊 Found ${translations.length} translation entries`);
    
    const sqlStatements = [];
    const section = 'footer';
    
    translations.forEach((row, index) => {
      const slug = row.slug || generateSlug(row.en);
      const en = row.en || '';
      const th = row.th || '';
      const zhCN = row.zhCN || '';
      const ru = row.ru || '';
      
      // Generate INSERT ... ON DUPLICATE KEY UPDATE statement
      const sql = `INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES (${escapeSQL(section)}, ${escapeSQL(slug)}, ${escapeSQL(en)}, ${escapeSQL(th)}, ${escapeSQL(zhCN)}, ${escapeSQL(ru)}, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();`;
      
      sqlStatements.push(sql);
      
      console.log(`✅ Generated SQL for: ${slug} (${en})`);
    });
    
    // Write SQL statements to file
    const outputFile = path.join(__dirname, 'import-footer-translations.sql');
    const sqlContent = sqlStatements.join('\n\n') + '\n';
    
    fs.writeFileSync(outputFile, sqlContent);
    
    console.log('\n🎉 SQL Generation Complete!');
    console.log(`📁 Output file: ${outputFile}`);
    console.log(`📊 Generated ${sqlStatements.length} SQL statements`);
    console.log('\n📋 Summary:');
    console.log(`- Section: ${section}`);
    console.log(`- Total entries: ${translations.length}`);
    console.log(`- Languages: en, th, zhCN, ru`);
    
    console.log('\n🔧 Next steps:');
    console.log('1. Copy the SQL statements from the output file');
    console.log('2. Execute them via MCP MySQL connection');
    console.log('3. Verify the data in ui_string table');
    
    // Display first few SQL statements for preview
    console.log('\n👀 Preview of generated SQL:');
    console.log('=' .repeat(80));
    sqlStatements.slice(0, 3).forEach((sql, index) => {
      console.log(`-- Statement ${index + 1}:`);
      console.log(sql);
      console.log('');
    });
    
    if (sqlStatements.length > 3) {
      console.log(`... and ${sqlStatements.length - 3} more statements`);
    }
    
    return {
      success: true,
      count: translations.length,
      outputFile: outputFile
    };
    
  } catch (error) {
    console.error('❌ Error generating SQL statements:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting Footer Translation Import Script...');
  console.log('=' .repeat(80));
  
  const result = generateSQLStatements();
  
  if (result.success) {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Script failed:', result.error);
    process.exit(1);
  }
}

module.exports = { generateSQLStatements };
