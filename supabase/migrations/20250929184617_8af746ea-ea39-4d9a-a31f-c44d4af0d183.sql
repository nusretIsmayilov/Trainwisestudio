-- Phase 1: Critical Data Protection Fixes

-- 1. Create function to check coach-customer relationship
CREATE OR REPLACE FUNCTION public.is_coach_customer_relationship(coach_user_id uuid, customer_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = customer_user_id 
    AND coach_id = coach_user_id
  );
$$;

-- 2. Fix onboarding_details RLS - restrict health data access to coach-customer relationships only
DROP POLICY IF EXISTS "Coaches can view all onboarding details" ON public.onboarding_details;

CREATE POLICY "Coaches can view their assigned customers onboarding details" 
ON public.onboarding_details 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.is_coach_customer_relationship(auth.uid(), user_id)
);

-- 3. Add program access for customers to view their assigned programs
CREATE POLICY "Customers can view assigned programs" 
ON public.programs 
FOR SELECT 
USING (auth.uid() = assigned_to);

-- 4. Enable basic profile discovery while protecting sensitive data
-- Allow coaches to view basic customer info for their assigned customers
CREATE POLICY "Coaches can view assigned customers basic profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  (role = 'customer' AND public.is_coach_customer_relationship(auth.uid(), id))
);

-- Allow customers to view coach profiles for discovery (coaches are public)
CREATE POLICY "Public can view coach profiles" 
ON public.profiles 
FOR SELECT 
USING (role = 'coach');

-- 5. Create secure role checking function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.profiles 
  WHERE id = user_id;
$$;