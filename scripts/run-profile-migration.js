const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Path to the migration file
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', 'update_user_profiles_schema.sql');

// Check if migration file exists
if (!fs.existsSync(migrationFile)) {
  console.error(`Migration file not found: ${migrationFile}`);
  process.exit(1);
}

console.log('Running user_profiles table migration...');

try {
  // Read the SQL file
  const sql = fs.readFileSync(migrationFile, 'utf8');
  
  // Create a temporary file with the SQL and credentials to use with psql
  const tempSqlFile = path.join(__dirname, 'temp_migration.sql');
  fs.writeFileSync(tempSqlFile, sql);
  
  // Execute the SQL using the Supabase REST API
  console.log('Migration SQL:');
  console.log(sql);
  
  console.log('\nTo run this migration, you have two options:');
  
  console.log('\nOption 1: Run through Supabase Dashboard');
  console.log('1. Log in to your Supabase dashboard at https://app.supabase.io');
  console.log(`2. Select your project: ${SUPABASE_URL.replace('https://', '')}`);
  console.log('3. Go to the SQL Editor');
  console.log('4. Create a new query');
  console.log('5. Paste the SQL above');
  console.log('6. Click "Run"');
  
  console.log('\nOption 2: Use Supabase CLI');
  console.log('If you have Supabase CLI installed, run:');
  console.log(`supabase db push -d ${SUPABASE_URL} --db-password <your-db-password>`);
  
  // Clean up
  fs.unlinkSync(tempSqlFile);
  
  console.log('\nMigration file created successfully. Follow the instructions above to apply it to your database.');
} catch (error) {
  console.error('Error preparing migration:', error);
  process.exit(1);
} 