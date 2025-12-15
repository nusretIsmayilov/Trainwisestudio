-- Add coach profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS socials jsonb DEFAULT '[]'::jsonb;

-- Create index for skills for efficient filtering/searching
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);