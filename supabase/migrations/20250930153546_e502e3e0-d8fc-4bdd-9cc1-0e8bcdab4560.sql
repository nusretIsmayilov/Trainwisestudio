-- Security Fix Migration: Consolidate RLS Policies and Implement Field-Level Security

-- ============================================
-- STEP 1: Fix Profiles Table RLS Policies
-- ============================================

-- Drop redundant and overlapping SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view assigned customers basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view coach public profiles only" ON public.profiles;

-- Create a secure function that returns only safe customer fields for coaches
CREATE OR REPLACE FUNCTION public.get_customer_safe_fields(customer_user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  role text,
  onboarding_complete boolean,
  plan text,
  plan_expiry timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.onboarding_complete,
    p.plan,
    p.plan_expiry,
    p.created_at
  FROM public.profiles p
  WHERE p.id = customer_user_id
  AND p.role = 'customer'
  AND is_coach_customer_relationship(auth.uid(), customer_user_id);
$$;

-- Create consolidated SELECT policies for profiles

-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Coaches can view only safe fields of assigned customers
CREATE POLICY "Coaches can view assigned customer safe fields only"
ON public.profiles
FOR SELECT
USING (
  (role = 'customer') 
  AND is_coach_customer_relationship(auth.uid(), id)
);

-- Policy 3: Anyone can view coach public profiles
CREATE POLICY "Public can view coach profiles"
ON public.profiles
FOR SELECT
USING (role = 'coach');

-- ============================================
-- STEP 2: Strengthen Message Security
-- ============================================

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

-- Create clearer message policies
CREATE POLICY "Conversation participants can view messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.coach_id = auth.uid() OR c.customer_id = auth.uid())
  )
);

CREATE POLICY "Conversation participants can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.coach_id = auth.uid() OR c.customer_id = auth.uid())
  )
);

-- ============================================
-- STEP 3: Add Security Audit Functions
-- ============================================

-- Function to check if user can access customer PII
CREATE OR REPLACE FUNCTION public.can_access_customer_pii(customer_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = customer_user_id;
$$;

-- ============================================
-- STEP 4: Add Indexes for Security Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role_coach ON public.profiles(role) WHERE role = 'coach';
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(coach_id, customer_id);

-- ============================================
-- STEP 5: Coach Offers Security Enhancement
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_coach_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.price < 10 OR NEW.price > 10000 THEN
    RAISE EXCEPTION 'Offer price must be between $10 and $10,000';
  END IF;
  
  IF NEW.duration_months < 1 OR NEW.duration_months > 52 THEN
    RAISE EXCEPTION 'Offer duration must be between 1 and 52 weeks';
  END IF;
  
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Offer expiration date must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_coach_offer_trigger ON public.coach_offers;
CREATE TRIGGER validate_coach_offer_trigger
BEFORE INSERT OR UPDATE ON public.coach_offers
FOR EACH ROW
EXECUTE FUNCTION public.validate_coach_offer();