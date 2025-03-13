-- Rename notes column to job_description in job_applications table
ALTER TABLE public.job_applications RENAME COLUMN notes TO job_description;

-- Update any existing triggers or functions that might reference this column
-- No triggers or functions directly reference this column based on the schema

-- Update comments if any
COMMENT ON COLUMN public.job_applications.job_description IS 'Detailed job description for the application'; 