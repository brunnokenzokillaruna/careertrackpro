// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.local') });

// Create Supabase client
const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please run:');
  console.error('npm run setup-env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Known table schemas
const tableSchemas = {
  user_profiles: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'full_name', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'education', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'experience', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'skills', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'courses', data_type: 'text', is_nullable: 'YES' }
  ],
  ai_keys: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'provider', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'api_key', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ],
  documents: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'content', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'type', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ],
  interviews: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'job_application_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'date', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'type', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'notes', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ],
  job_applications: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'company', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'position', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'status', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'applied_date', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'notes', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ],
  user_preferences: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'theme', data_type: 'text', is_nullable: 'YES' },
    { column_name: 'notifications_enabled', data_type: 'boolean', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ],
  users: [
    { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
    { column_name: 'email', data_type: 'text', is_nullable: 'NO' },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'NO' }
  ]
};

/**
 * List all tables in the database
 */
async function listTables() {
  try {
    // Try to query each known table to check if it exists
    const tables = [];
    
    for (const tableName of Object.keys(tableSchemas)) {
      const { error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
        
      if (!error) {
        tables.push(tableName);
      }
    }
    
    return tables.sort();
  } catch (error) {
    console.error('Error in listTables:', error);
    return [];
  }
}

/**
 * Get information about a specific table
 */
async function getTableInfo(tableName) {
  try {
    // Return the known schema for the table
    if (tableSchemas[tableName]) {
      return {
        name: tableName,
        columns: tableSchemas[tableName]
      };
    }

    // If we don't have a known schema, try to get a sample row
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error(`Error getting sample data for table ${tableName}:`, sampleError);
      return null;
    }

    // Get the column names and types from the sample data
    const columns = sampleData && sampleData.length > 0 
      ? Object.entries(sampleData[0]).map(([name, value]) => ({
          column_name: name,
          data_type: typeof value === 'object' && value !== null ? 'jsonb' : typeof value,
          is_nullable: 'YES', // We can't determine this from the data alone
          column_default: null
        }))
      : [];

    return {
      name: tableName,
      columns
    };
  } catch (error) {
    console.error('Error in getTableInfo:', error);
    return null;
  }
}

/**
 * Generate TypeScript interfaces from database schema
 */
async function generateTypeScriptInterfaces() {
  try {
    const tables = await listTables();
    let interfaces = '';
    
    for (const tableName of tables) {
      const tableInfo = await getTableInfo(tableName);
      if (!tableInfo) continue;
      
      // Convert table name to PascalCase for interface name
      const interfaceName = tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      interfaces += `export interface ${interfaceName} {\n`;
      
      for (const column of tableInfo.columns) {
        // Convert SQL types to TypeScript types
        let tsType = 'any';
        const columnType = column.data_type.toLowerCase();
        
        if (columnType.includes('int') || columnType.includes('float') || columnType.includes('numeric')) {
          tsType = 'number';
        } else if (columnType.includes('text') || columnType.includes('char') || columnType.includes('uuid')) {
          tsType = 'string';
        } else if (columnType.includes('bool')) {
          tsType = 'boolean';
        } else if (columnType.includes('json') || columnType.includes('jsonb')) {
          tsType = 'Record<string, any>';
        } else if (columnType.includes('timestamp') || columnType.includes('date')) {
          tsType = 'Date | string';
        }
        
        // Add nullable modifier if the field is nullable
        const nullableModifier = column.is_nullable === 'YES' ? ' | null' : '';
        interfaces += `  ${column.column_name}: ${tsType}${nullableModifier};\n`;
      }
      
      interfaces += `}\n\n`;
    }
    
    return interfaces;
  } catch (error) {
    console.error('Error generating TypeScript interfaces:', error);
    return '';
  }
}

module.exports = {
  listTables,
  getTableInfo,
  generateTypeScriptInterfaces
}; 