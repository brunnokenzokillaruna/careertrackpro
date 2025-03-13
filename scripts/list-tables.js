#!/usr/bin/env node

const { listTables, getTableInfo } = require('./db-utils');

async function main() {
  try {
    console.log('Listing database tables and their structure...\n');
    
    const tables = await listTables();
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
      return;
    }
    
    // Get and display information for each table
    for (const tableName of tables) {
      const tableInfo = await getTableInfo(tableName);
      
      if (tableInfo) {
        console.log(`Table: ${tableName}`);
        console.log('Columns:');
        tableInfo.columns.forEach(column => {
          const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = column.column_default ? ` DEFAULT ${column.column_default}` : '';
          console.log(`  - ${column.column_name} (${column.data_type}) ${nullable}${defaultValue}`);
        });
        console.log(''); // Empty line between tables
      }
    }
  } catch (error) {
    console.error('Error listing database tables:', error);
    process.exit(1);
  }
}

main(); 