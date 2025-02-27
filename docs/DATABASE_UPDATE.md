# Database Update Instructions

This document provides instructions on how to update your Supabase database schema to support all the profile data fields in the CareerTrack Pro application.

## What's Being Updated

We're adding the following fields to the `user_profiles` table:

- `email` - User's email address
- `phone` - User's phone number
- `location` - User's location (city, country)
- `website` - User's personal website URL
- `linkedin` - User's LinkedIn profile URL
- `github` - User's GitHub profile URL

## Update Methods

### Method 1: Using the Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Select your project (iiugtjtdfavdojniaguw)
3. Go to the SQL Editor (left sidebar)
4. Click "New Query"
5. Copy and paste the following SQL:

```sql
-- Update user_profiles table to add contact information fields
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT;

-- Add comments to explain the fields
COMMENT ON COLUMN public.user_profiles.email IS 'User email address';
COMMENT ON COLUMN public.user_profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.user_profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN public.user_profiles.website IS 'User personal website URL';
COMMENT ON COLUMN public.user_profiles.linkedin IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.user_profiles.github IS 'User GitHub profile URL';
```

6. Click "Run" to execute the SQL
7. Verify the changes by running:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### Method 2: Using the Supabase CLI

If you have the Supabase CLI installed:

1. Make sure you're logged in to the Supabase CLI
2. Navigate to the project root directory
3. Run the following command:

```bash
supabase db push -d https://iiugtjtdfavdojniaguw.supabase.co --db-password <your-db-password>
```

### Method 3: Using the Helper Script

We've provided a helper script that will guide you through the process:

1. Make sure you have Node.js installed
2. Open a terminal in the project root directory
3. Run:

```bash
node scripts/run-profile-migration.js
```

4. Follow the instructions provided by the script

## Verifying the Update

After updating the database, you can verify that the new fields are available by:

1. Going to the Supabase dashboard
2. Selecting your project
3. Going to the Table Editor
4. Selecting the `user_profiles` table
5. Checking that the new columns are present

## Troubleshooting

If you encounter any issues:

1. Check that you have the necessary permissions to modify the database schema
2. Ensure that the `user_profiles` table exists
3. If a column already exists, the `ADD COLUMN IF NOT EXISTS` statement will skip it without error

For further assistance, please contact the development team.
