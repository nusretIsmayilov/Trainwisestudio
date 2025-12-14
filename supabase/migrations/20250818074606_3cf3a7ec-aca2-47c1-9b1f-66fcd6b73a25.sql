
-- 0) Safety: ensure Row Level Security (RLS) is enabled
alter table public.profiles enable row level security;

-- 1) Policies (create only if missing)
do $$
begin
  -- Users can view their own profile
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view their own profile'
  ) then
    create policy "Users can view their own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  -- Users can update their own profile
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = id);
  end if;

  -- Users can insert their own profile (self-healing)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;

-- 2) Backfill: create profiles for any existing auth.users missing a row
-- Defaults: role = 'customer', onboarding_complete = false
insert into public.profiles (id, email, role, onboarding_complete, created_at, updated_at)
select
  u.id,
  u.email,
  'customer',
  false,
  now(),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Keep updated_at fresh on UPDATEs
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
      before update on public.profiles
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;
