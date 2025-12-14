-- Fix Error-Level Security Issues

-- 1. Enable RLS on profiles table (policies already exist but RLS was disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on motivation_messages table and add policies
ALTER TABLE public.motivation_messages ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read motivation messages
CREATE POLICY "Anyone can read motivation messages"
  ON public.motivation_messages FOR SELECT
  USING (true);

-- Only admins can manage motivation messages
CREATE POLICY "Admins can manage motivation messages"
  ON public.motivation_messages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fix coaches view - recreate without SECURITY DEFINER (uses INVOKER by default)
DROP VIEW IF EXISTS public.coaches;

CREATE VIEW public.coaches AS
  SELECT id,
    email,
    full_name,
    tagline,
    bio,
    avatar_url,
    skills,
    certifications,
    socials,
    price_min_cents,
    price_max_cents,
    created_at,
    updated_at
  FROM profiles p
  WHERE (role = 'coach'::text);

-- Grant access to the view
GRANT SELECT ON public.coaches TO anon, authenticated;

-- 4. Fix renewal_prompts view - recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.renewal_prompts;

CREATE VIEW public.renewal_prompts AS
  SELECT id AS contract_id,
    coach_id,
    customer_id,
    end_date,
    GREATEST(((end_date - '5 days'::interval))::date, ((now() AT TIME ZONE 'utc'::text))::date) AS prompt_from
  FROM contracts c
  WHERE ((status = 'active'::contract_status) AND (end_date <= (((now() AT TIME ZONE 'utc'::text))::date + '5 days'::interval)));

-- Grant access to authenticated users only (they'll be subject to RLS on contracts)
GRANT SELECT ON public.renewal_prompts TO authenticated;