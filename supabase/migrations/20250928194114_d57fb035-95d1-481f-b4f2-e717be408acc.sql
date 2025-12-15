-- First, update the existing RLS policies on profiles table to be more restrictive
-- Remove the broad coach viewing policy that exposes emails
DROP POLICY IF EXISTS "Users can view coach profiles" ON public.profiles;

-- Create more restrictive policies that protect sensitive information

-- Users can view their own full profile
CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a function to get public coach data without sensitive fields
CREATE OR REPLACE FUNCTION public.get_public_coach_profiles()
RETURNS TABLE (
    id uuid,
    full_name text,
    avatar_url text,
    tagline text,
    bio text,
    skills text[],
    certifications jsonb,
    socials jsonb,
    role text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        p.tagline,
        p.bio,
        p.skills,
        p.certifications,
        p.socials,
        p.role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.role = 'coach'
    ORDER BY p.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_coach_profiles() TO authenticated;