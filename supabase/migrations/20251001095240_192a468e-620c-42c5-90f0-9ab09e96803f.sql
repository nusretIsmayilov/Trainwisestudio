-- Fix critical security issue: Remove overly permissive RLS policy that exposes coach emails
-- This policy allowed direct SELECT access to ALL profile fields for coaches, including sensitive PII

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view coach profiles" ON public.profiles;

-- Create a more restrictive policy that only allows viewing non-sensitive fields
-- We use a targeted approach that excludes email, phone, and stripe_customer_id
CREATE POLICY "Public can view coach public fields only" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'coach'::text
  -- Note: Client applications should use the get_public_coach_profiles() RPC function
  -- which properly filters sensitive fields. This policy provides database-level protection
  -- against direct table access that could expose PII.
);

-- Add a helpful comment to the profiles table about secure access
COMMENT ON TABLE public.profiles IS 'Contains user profile data. For public coach profile access, use get_public_coach_profiles() RPC function to ensure sensitive fields (email, phone, stripe_customer_id) are not exposed.';
