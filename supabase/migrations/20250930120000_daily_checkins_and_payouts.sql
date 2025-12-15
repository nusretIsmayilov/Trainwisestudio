-- daily check-ins table for water, mood, energy, sleep
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default (now() at time zone 'utc')::date,
  water_liters numeric(4,2),
  mood integer check (mood between 1 and 5),
  energy integer check (energy between 1 and 5),
  sleep_hours numeric(4,2),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_checkins enable row level security;

create policy "Daily checkins are viewable by owner" on public.daily_checkins
  for select using (auth.uid() = user_id);

create policy "Daily checkins are insertable by owner" on public.daily_checkins
  for insert with check (auth.uid() = user_id);

create policy "Daily checkins are updatable by owner" on public.daily_checkins
  for update using (auth.uid() = user_id);

-- payouts and commission tracking
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null,
  platform_fee_cents integer not null,
  net_amount_cents integer not null,
  status text not null check (status in ('pending','paid','failed')),
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

alter table public.payouts enable row level security;

create policy "Payouts are viewable by coach" on public.payouts
  for select using (auth.uid() = coach_id);


