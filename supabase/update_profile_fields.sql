-- Update user_profiles table to add contact information fields
-- Run this in the Supabase SQL Editor

-- Add missing contact information fields
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

-- Add a description field to experience JSON structure
-- This is just a comment to remind you that the experience JSON should include:
-- company, title, startDate, endDate, description, technologies

-- Verify the changes
SELECT column_name, data_type, description 
FROM information_schema.columns 
LEFT JOIN pg_description ON 
  pg_description.objoid = (quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass::oid AND 
  pg_description.objsubid = ordinal_position
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position; 