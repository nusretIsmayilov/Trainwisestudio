-- Explicitly set SECURITY INVOKER on views

-- Drop and recreate coaches view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.coaches;

CREATE VIEW public.coaches 
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.coaches TO anon, authenticated;

-- Drop and recreate renewal_prompts view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.renewal_prompts;

CREATE VIEW public.renewal_prompts
WITH (security_invoker = true)
AS
  SELECT id AS contract_id,
    coach_id,
    customer_id,
    end_date,
    GREATEST(((end_date - '5 days'::interval))::date, ((now() AT TIME ZONE 'utc'::text))::date) AS prompt_from
  FROM contracts c
  WHERE ((status = 'active'::contract_status) AND (end_date <= (((now() AT TIME ZONE 'utc'::text))::date + '5 days'::interval)));

GRANT SELECT ON public.renewal_prompts TO authenticated;