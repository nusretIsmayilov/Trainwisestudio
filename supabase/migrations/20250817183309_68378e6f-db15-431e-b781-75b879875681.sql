
-- Enable UUID generation (needed only if you use gen_random_uuid)
create extension if not exists pgcrypto with schema public;

-- 1) Add phone column to profiles if missing
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'phone'
  ) then
    alter table public.profiles
      add column phone text;
  end if;
end $$;

-- Ensure updated_at is maintained on profiles
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
      before update on public.profiles
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;

-- 2) Create onboarding_details table (separate from profiles)
create table if not exists public.onboarding_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Personal info
  weight numeric(5,2),             -- e.g., kg
  height numeric(5,2),             -- e.g., cm
  gender text,
  dob date,
  country text,

  -- Goals and preferences
  goals text[] not null default '{}',
  allergies text[] not null default '{}',
  training_likes text[] not null default '{}',
  training_dislikes text[] not null default '{}',
  injuries text[] not null default '{}',
  meditation_experience text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure one details row per user
create unique index if not exists onboarding_details_user_id_idx
  on public.onboarding_details(user_id);

-- Maintain updated_at on onboarding_details
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_onboarding_details_updated_at'
  ) then
    create trigger set_onboarding_details_updated_at
      before update on public.onboarding_details
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;

-- 3) Enable RLS on onboarding_details
alter table public.onboarding_details enable row level security;

-- Helper function: check if current user is a coach
create or replace function public.current_user_is_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'coach'
  );
$$;

-- Policies for onboarding_details

-- INSERT: only allow inserting your own details
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_details'
      and policyname = 'Users can insert their own onboarding details'
  ) then
    create policy "Users can insert their own onboarding details"
      on public.onboarding_details
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

-- UPDATE: only allow updating your own details
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_details'
      and policyname = 'Users can update their own onboarding details'
  ) then
    create policy "Users can update their own onboarding details"
      on public.onboarding_details
      for update
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- DELETE: only allow deleting your own details
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_details'
      and policyname = 'Users can delete their own onboarding details'
  ) then
    create policy "Users can delete their own onboarding details"
      on public.onboarding_details
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- SELECT: owners OR any user whose role is 'coach'
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'onboarding_details'
      and policyname = 'Users and coaches can view onboarding details'
  ) then
    create policy "Users and coaches can view onboarding details"
      on public.onboarding_details
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or public.current_user_is_coach()
      );
  end if;
end $$;
