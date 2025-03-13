#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateTypeScriptInterfaces } = require('./db-utils');

async function main() {
  try {
    console.log('Generating TypeScript interfaces from database schema...');
    
    // Generate TypeScript interfaces
    const interfaces = await generateTypeScriptInterfaces();
    
    if (!interfaces) {
      console.error('No interfaces generated. Check database connection and schema.');
      process.exit(1);
    }
    
    // Create types directory if it doesn't exist
    const typesDir = path.join(__dirname, '..', 'src', 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    // Write the result to a file
    const outputFile = path.join(typesDir, 'database.ts');
    fs.writeFileSync(outputFile, `// Auto-generated from database schema\n\n${interfaces}`);
    
    console.log(`TypeScript interfaces generated successfully and saved to ${outputFile}`);
  } catch (error) {
    console.error('Error generating TypeScript interfaces:', error);
    process.exit(1);
  }
}

main(); 