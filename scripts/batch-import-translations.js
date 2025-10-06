const fs = require('fs');

// Read the generated SQL file
const sqlFile = '/Users/ize/freelance/backendDD_property/scripts/import-translations.sql';
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Split into individual statements
const statements = sqlContent.split('\n').filter(stmt => stmt.trim().length > 0);

console.log(`📊 Found ${statements.length} SQL statements to execute`);

// Output statements for manual execution
statements.forEach((stmt, index) => {
  console.log(`\n-- Statement ${index + 1}:`);
  console.log(stmt);
});

console.log('\n✨ All SQL statements ready for execution');
console.log('📝 You can copy these statements and execute them via MCP MySQL connection');

// Also create a simplified version for easier copying
const simplifiedStatements = statements.map((stmt, index) => `-- ${index + 1}\n${stmt}`).join('\n\n');
fs.writeFileSync('/Users/ize/freelance/backendDD_property/scripts/import-translations-formatted.sql', simplifiedStatements);
console.log('📄 Formatted SQL file written to: scripts/import-translations-formatted.sql');
