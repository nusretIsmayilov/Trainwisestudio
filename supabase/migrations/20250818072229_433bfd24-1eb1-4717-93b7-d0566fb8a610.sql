-- 1) Ensure phone column exists on public.profiles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'phone'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN phone text;
  END IF;
END $$;

-- 2) Allow authenticated users to INSERT their own profile (RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3) Backfill: create profiles for any existing auth.users missing a row
INSERT INTO public.profiles (id, email, role, onboarding_complete)
SELECT u.id, u.email, 'customer', false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;