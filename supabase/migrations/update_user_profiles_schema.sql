-- Add missing contact information fields to user_profiles table
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