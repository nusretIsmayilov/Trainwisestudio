-- Create a SECURITY DEFINER function to fetch public profile fields for given user ids
create or replace function public.get_public_profiles(ids uuid[])
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.avatar_url, p.email
  from public.profiles p
  where p.id = any(ids);
$$;

revoke all on function public.get_public_profiles(uuid[]) from public;
grant execute on function public.get_public_profiles(uuid[]) to authenticated, anon;


