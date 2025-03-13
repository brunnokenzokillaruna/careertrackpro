#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    console.log('Setting up environment variables for database access...');
    
    // Check if .env.local file exists
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Found existing .env.local file.');
    } else {
      console.log('No .env.local file found. Creating a new one.');
    }
    
    // Check if Supabase URL is already set
    const supabaseUrlRegex = /NEXT_PUBLIC_SUPABASE_URL=(.+)/;
    let supabaseUrl = envContent.match(supabaseUrlRegex)?.[1] || '';
    
    if (!supabaseUrl) {
      supabaseUrl = await new Promise(resolve => {
        rl.question('Enter your Supabase URL: ', answer => resolve(answer));
      });
    } else {
      console.log(`Using existing Supabase URL: ${supabaseUrl}`);
    }
    
    // Check if Supabase Anon Key is already set
    const supabaseKeyRegex = /NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/;
    let supabaseKey = envContent.match(supabaseKeyRegex)?.[1] || '';
    
    if (!supabaseKey) {
      supabaseKey = await new Promise(resolve => {
        rl.question('Enter your Supabase Anon Key: ', answer => resolve(answer));
      });
    } else {
      console.log(`Using existing Supabase Anon Key: ${supabaseKey}`);
    }
    
    // Create or update .env.local file
    const newEnvContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}
${envContent.replace(supabaseUrlRegex, '').replace(supabaseKeyRegex, '').trim()}`;
    
    fs.writeFileSync(envPath, newEnvContent);
    console.log('.env.local file updated successfully!');
    
    rl.close();
  } catch (error) {
    console.error('Error setting up environment variables:', error);
    rl.close();
    process.exit(1);
  }
}

main(); 