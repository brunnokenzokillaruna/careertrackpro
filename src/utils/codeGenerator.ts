import { getSimplifiedSchema, tableExists, columnExists } from './databaseManager';

/**
 * Get database schema information for code generation
 * @returns Database schema information in a format suitable for code generation
 */
export const getSchemaForCodeGeneration = async () => {
  try {
    const schema = await getSimplifiedSchema();
    return {
      schema,
      tableExists: async (tableName: string) => await tableExists(tableName),
      columnExists: async (tableName: string, columnName: string) => await columnExists(tableName, columnName)
    };
  } catch (error) {
    console.error('Error getting schema for code generation:', error);
    return {
      schema: {},
      tableExists: async () => false,
      columnExists: async () => false
    };
  }
};

/**
 * Generate TypeScript interfaces from database schema
 * @returns TypeScript interfaces as a string
 */
export const generateTypeScriptInterfaces = async () => {
  try {
    const schema = await getSimplifiedSchema();
    let interfaces = '';
    
    for (const [tableName, columns] of Object.entries(schema)) {
      // Convert table name to PascalCase for interface name
      const interfaceName = tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      interfaces += `export interface ${interfaceName} {\n`;
      
      for (const [columnName, columnType] of Object.entries(columns)) {
        // Convert SQL types to TypeScript types
        let tsType = 'any';
        
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
        
        // Check if the column is nullable
        const isNullable = columnType.includes('NULL');
        const nullableModifier = isNullable ? ' | null' : '';
        
        interfaces += `  ${columnName}: ${tsType}${nullableModifier};\n`;
      }
      
      interfaces += '}\n\n';
    }
    
    return interfaces;
  } catch (error) {
    console.error('Error generating TypeScript interfaces:', error);
    return '';
  }
}; 