
-- 1) Backfill profiles for any existing users missing a profile row
insert into public.profiles (id, email, role, onboarding_complete)
select
  u.id,
  u.email,
  'customer'::text as role,
  false as onboarding_complete
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2) Ensure Row Level Security is enabled on profiles
alter table public.profiles enable row level security;

-- 3) Create a secure INSERT policy if it doesn't already exist
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and polname = 'Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;
