
-- 1. Create the profiles table (id matches auth.users.id to align with existing code)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'coach')),
  onboarding_complete boolean not null default false,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.id is 'Same as auth.users.id';

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS policies: users can view and update their own profiles
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view their own profile'
  ) then
    create policy "Users can view their own profile"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;

-- 4. Function to update updated_at automatically
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 5. Trigger to apply updated_at on updates
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_profiles_updated_at'
  ) then
    create trigger update_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.update_updated_at_column();
  end if;
end $$;

-- 6. Function to handle new user signup and create a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 7. Trigger on auth.users to automatically create a profile when a user signs up
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end $$;
