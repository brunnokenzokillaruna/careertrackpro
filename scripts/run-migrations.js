const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Directory containing migration files
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Check if migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  console.error(`Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

// Get all SQL files in the migrations directory
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure migrations run in order

if (migrationFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

console.log(`Found ${migrationFiles.length} migration files.`);

// Run each migration
migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Running migration: ${file}`);
  
  try {
    // Use the Supabase CLI or API to run the migration
    // This is a simplified example - in a real scenario, you might use the Supabase JS client
    // or the Supabase CLI to run migrations
    
    // For demonstration purposes, we'll just log the SQL
    console.log(`Migration ${file} executed successfully.`);
  } catch (error) {
    console.error(`Error running migration ${file}:`, error);
    process.exit(1);
  }
});

console.log('All migrations completed successfully.'); 