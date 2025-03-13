import { supabase } from '@/lib/supabase/client';

/**
 * Database schema utility for Supabase
 * Provides access to database schema information for code generation
 */

/**
 * Get a list of all tables in the database
 * @returns List of table names in the public schema
 */
export const listTables = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.error('Error listing tables:', error);
      return [];
    }
    
    return data.map(row => row.table_name);
  } catch (error) {
    console.error('Error in listTables:', error);
    return [];
  }
};

/**
 * Get detailed information about a specific table
 * @param tableName Name of the table to get information for
 * @returns Detailed table information including columns, types, and constraints
 */
export const getTableInfo = async (tableName: string): Promise<any> => {
  try {
    // Get column information
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('Error getting column information:', columnsError);
      return null;
    }
    
    // Get primary key information
    const { data: primaryKeys, error: pkError } = await supabase
      .from('information_schema.key_column_usage')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('constraint_name', `${tableName}_pkey`);
    
    if (pkError) {
      console.error('Error getting primary key information:', pkError);
    }
    
    // Get foreign key information
    const { data: foreignKeys, error: fkError } = await supabase
      .from('information_schema.key_column_usage')
      .select(`
        column_name,
        constraint_name,
        referenced_table_name:information_schema.referential_constraints!inner(referenced_table_name),
        referenced_column_name:information_schema.referential_constraints!inner(referenced_column_name)
      `)
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .not('constraint_name', 'like', '%_pkey');
    
    if (fkError) {
      console.error('Error getting foreign key information:', fkError);
    }
    
    return {
      name: tableName,
      columns: columns || [],
      primaryKeys: primaryKeys || [],
      foreignKeys: foreignKeys || []
    };
  } catch (error) {
    console.error('Error in getTableInfo:', error);
    return null;
  }
};

/**
 * Get schema information for all tables in the database
 * @returns Complete database schema information
 */
export const getDatabaseSchema = async (): Promise<any> => {
  try {
    const tables = await listTables();
    const schema: Record<string, any> = {};
    
    for (const tableName of tables) {
      schema[tableName] = await getTableInfo(tableName);
    }
    
    return schema;
  } catch (error) {
    console.error('Error in getDatabaseSchema:', error);
    return {};
  }
};

/**
 * Get a simplified version of the database schema
 * @returns Simplified schema with table names and column definitions
 */
export const getSimplifiedSchema = async (): Promise<Record<string, Record<string, string>>> => {
  try {
    const fullSchema = await getDatabaseSchema();
    const simplifiedSchema: Record<string, Record<string, string>> = {};
    
    Object.entries(fullSchema).forEach(([tableName, tableInfo]: [string, any]) => {
      simplifiedSchema[tableName] = {};
      
      tableInfo.columns.forEach((column: any) => {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = column.column_default ? `DEFAULT ${column.column_default}` : '';
        simplifiedSchema[tableName][column.column_name] = `${column.data_type} ${nullable} ${defaultValue}`.trim();
      });
    });
    
    return simplifiedSchema;
  } catch (error) {
    console.error('Error in getSimplifiedSchema:', error);
    return {};
  }
};

/**
 * Check if a table exists in the database
 * @param tableName Name of the table to check
 * @returns Boolean indicating if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const tables = await listTables();
    return tables.includes(tableName);
  } catch (error) {
    console.error('Error in tableExists:', error);
    return false;
  }
};

/**
 * Check if a column exists in a specific table
 * @param tableName Name of the table to check
 * @param columnName Name of the column to check
 * @returns Boolean indicating if the column exists in the table
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const tableInfo = await getTableInfo(tableName);
    if (!tableInfo) return false;
    
    return tableInfo.columns.some((column: any) => column.column_name === columnName);
  } catch (error) {
    console.error('Error in columnExists:', error);
    return false;
  }
}; 