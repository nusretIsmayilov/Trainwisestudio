-- Add RLS policies to allow coaches to view their clients' daily_checkins and weight_entries

-- Daily Check-ins: Allow coaches to view their assigned customers' check-ins
DROP POLICY IF EXISTS "Coaches can view assigned customers daily checkins" ON public.daily_checkins;
CREATE POLICY "Coaches can view assigned customers daily checkins"
ON public.daily_checkins
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.is_coach_customer_relationship(auth.uid(), user_id)
);

-- Weight Entries: Allow coaches to view their assigned customers' weight entries
DROP POLICY IF EXISTS "Coaches can view assigned customers weight entries" ON public.weight_entries;
CREATE POLICY "Coaches can view assigned customers weight entries"
ON public.weight_entries
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.is_coach_customer_relationship(auth.uid(), user_id)
);

-- Program Entries: Allow coaches to view their assigned customers' program entries
-- Check if program_entries table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'program_entries') THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Coaches can view assigned customers program entries" ON public.program_entries;
    
    -- Create policy for coaches to view their clients' program entries
    CREATE POLICY "Coaches can view assigned customers program entries"
    ON public.program_entries
    FOR SELECT
    USING (
      auth.uid() = user_id OR 
      EXISTS (
        SELECT 1 
        FROM public.programs p
        WHERE p.id = program_entries.program_id
        AND p.coach_id = auth.uid()
        AND p.assigned_to = program_entries.user_id
      )
    );
  END IF;
END $$;

