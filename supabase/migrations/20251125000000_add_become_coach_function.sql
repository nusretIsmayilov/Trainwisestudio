set search_path = public;

-- Create a function to allow users to become coaches
-- This can be called by any authenticated user (you may want to restrict this)
CREATE OR REPLACE FUNCTION public.become_coach()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the profile role to coach
  UPDATE public.profiles
  SET role = 'coach'
  WHERE id = auth.uid();
  
  -- The trigger will automatically sync to user_roles table
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.become_coach() TO authenticated;

-- Optional: Create an admin function to assign coach role to any user
CREATE OR REPLACE FUNCTION public.assign_coach_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin (optional security check)
  -- Uncomment if you want to restrict to admins only:
  -- IF NOT public.has_role(auth.uid(), 'admin') THEN
  --   RAISE EXCEPTION 'Only admins can assign coach role';
  -- END IF;
  
  -- Update the profile role to coach
  UPDATE public.profiles
  SET role = 'coach'
  WHERE id = target_user_id;
  
  -- The trigger will automatically sync to user_roles table
END;
$$;

-- Grant execute permission (adjust based on your security needs)
GRANT EXECUTE ON FUNCTION public.assign_coach_role(uuid) TO authenticated;


