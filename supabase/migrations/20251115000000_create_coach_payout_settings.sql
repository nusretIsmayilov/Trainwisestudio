set search_path = public;

-- Create coach_payout_settings table
create table if not exists public.coach_payout_settings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade unique,
  payout_method text not null check (payout_method in ('bank', 'paypal', 'stripe')) default 'bank',
  bank_details jsonb,
  paypal_email text,
  paypal_account_id text,
  stripe_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coach_payout_settings enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'coach_payout_settings' 
    and policyname = 'Coaches can view their own payout settings'
  ) then
    create policy "Coaches can view their own payout settings" on public.coach_payout_settings
    for select using (auth.uid() = coach_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'coach_payout_settings' 
    and policyname = 'Coaches can insert their own payout settings'
  ) then
    create policy "Coaches can insert their own payout settings" on public.coach_payout_settings
    for insert with check (auth.uid() = coach_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'coach_payout_settings' 
    and policyname = 'Coaches can update their own payout settings'
  ) then
    create policy "Coaches can update their own payout settings" on public.coach_payout_settings
    for update using (auth.uid() = coach_id);
  end if;
end $$;

-- Trigger to update updated_at
create trigger set_coach_payout_settings_updated_at
before update on public.coach_payout_settings
for each row execute procedure public.update_updated_at_column();

