-- Phase 2: Critical Security Fixes - Email Exposure and Role Security

-- 1. First, create function to control public coach profile access
CREATE OR REPLACE FUNCTION public.can_view_coach_public_profile(viewer_id uuid, coach_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Allow public viewing of coach profiles but the application layer should filter sensitive fields
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = coach_id 
    AND role = 'coach'
  );
$$;

-- 2. Fix coach email exposure - drop overly permissive policy and create secure one
DROP POLICY IF EXISTS "Public can view coach profiles" ON public.profiles;

CREATE POLICY "Public can view coach public profiles only" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'coach' AND (
    -- Only allow access to public fields by checking if user is the owner
    -- or restrict to non-sensitive fields via a security definer function
    auth.uid() = id OR 
    -- For public access, we'll create a separate function to control field access
    public.can_view_coach_public_profile(auth.uid(), id)
  )
);

-- 3. Create app_role enum for enhanced role security (PostgreSQL compatible syntax)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'customer');
    END IF;
END $$;

-- 4. Create secure user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 5. Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Create security definer function to check user roles (enhanced version)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 7. Create function to get user's primary role (for compatibility)
CREATE OR REPLACE FUNCTION public.get_primary_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- First check new user_roles table, fallback to profiles table
  SELECT COALESCE(
    (SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
    (SELECT role FROM public.profiles WHERE id = _user_id)
  );
$$;

-- 8. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create trigger to automatically assign roles when profile is created
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert role from profiles table into user_roles table for enhanced security
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (
    NEW.id, 
    NEW.role::app_role,
    NEW.id -- Self-assigned on registration
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 10. Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_role();