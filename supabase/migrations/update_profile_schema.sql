-- Update user_profiles table to support JSON arrays
ALTER TABLE public.user_profiles 
  ALTER COLUMN education TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN experience TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN skills TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN courses TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN languages TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN projects TYPE TEXT, -- Will store JSON array as string
  ALTER COLUMN certifications TYPE TEXT; -- Will store JSON array as string

-- Add comment to explain the storage format
COMMENT ON COLUMN public.user_profiles.education IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.experience IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.skills IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.courses IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.languages IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.projects IS 'Stored as JSON array string';
COMMENT ON COLUMN public.user_profiles.certifications IS 'Stored as JSON array string'; 