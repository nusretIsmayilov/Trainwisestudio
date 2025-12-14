-- Consolidated, idempotent migration to converge schema
set search_path = public;

-- Utility: updated_at trigger function
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'update_updated_at_column' and n.nspname = 'public'
  ) then
    create or replace function public.update_updated_at_column()
    returns trigger as $f$
    begin
      new.updated_at = now();
      return new;
    end;
    $f$ language plpgsql;
  end if;
end $$;

-- Enums for programs
do $$
begin
  if not exists (select 1 from pg_type where typname = 'program_status') then
    create type program_status as enum ('active', 'scheduled', 'draft', 'normal');
  end if;
  if not exists (select 1 from pg_type where typname = 'program_category') then
    create type program_category as enum ('fitness', 'nutrition', 'mental health');
  end if;
end $$;

-- programs table
create table if not exists public.programs (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  status program_status not null default 'draft',
  category program_category not null,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  scheduled_date timestamptz,
  plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.programs enable row level security;

drop policy if exists "Coaches can view their own programs" on public.programs;
create policy "Coaches can view their own programs"
on public.programs
for select
using (auth.uid() = coach_id);

drop policy if exists "Coaches can create their own programs" on public.programs;
create policy "Coaches can create their own programs"
on public.programs
for insert
with check (
  auth.uid() = coach_id
  and (
    assigned_to is null
    or public.is_coach_customer_relationship(coach_id, assigned_to)
  )
);

drop policy if exists "Coaches can update their own programs" on public.programs;
create policy "Coaches can update their own programs"
on public.programs
for update
using (auth.uid() = coach_id)
with check (
  auth.uid() = coach_id
  and (
    assigned_to is null
    or public.is_coach_customer_relationship(coach_id, assigned_to)
  )
);

drop policy if exists "Coaches can delete their own programs" on public.programs;
create policy "Coaches can delete their own programs"
on public.programs
for delete
using (auth.uid() = coach_id);

-- Customers can view assigned programs
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Customers can view assigned programs' and tablename = 'programs'
  ) then
    create policy "Customers can view assigned programs"
    on public.programs
    for select
    using (auth.uid() = assigned_to);
  end if;
end $$;

create index if not exists idx_programs_coach_id on public.programs(coach_id);
create index if not exists idx_programs_status on public.programs(status);
create index if not exists idx_programs_category on public.programs(category);
create index if not exists idx_programs_assigned_to on public.programs(assigned_to);

drop trigger if exists update_programs_updated_at on public.programs;
create trigger update_programs_updated_at
before update on public.programs
for each row
execute function public.update_updated_at_column();

-- coach_offers RLS policies (ensure both coach and customer can read; coach insert; both can update)
alter table if exists public.coach_offers enable row level security;

drop policy if exists "Offers readable by coach or customer" on public.coach_offers;
create policy "Offers readable by coach or customer" on public.coach_offers
  for select using (auth.uid() = coach_id or auth.uid() = customer_id);

drop policy if exists "Offers insertable by coach" on public.coach_offers;
create policy "Offers insertable by coach" on public.coach_offers
  for insert with check (auth.uid() = coach_id);

drop policy if exists "Offers updatable by coach or customer" on public.coach_offers;
create policy "Offers updatable by coach or customer" on public.coach_offers
  for update using (auth.uid() = coach_id or auth.uid() = customer_id);

-- Coaching contracts
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contract_status') then
    create type public.contract_status as enum ('pending','active','completed','expired','cancelled');
  end if;
end $$;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid,
  status contract_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  price_cents integer not null check (price_cents > 0),
  platform_fee_rate numeric(5,4) not null default 0.1500,
  -- Contract document and signatures (optional)
  document_url text,
  coach_signed_at timestamptz,
  customer_signed_at timestamptz,
  payout_id uuid references public.payouts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_id, customer_id, start_date, end_date)
);

alter table public.contracts enable row level security;

drop policy if exists "Contracts viewable by coach or customer" on public.contracts;
create policy "Contracts viewable by coach or customer" on public.contracts
  for select using (auth.uid() = coach_id or auth.uid() = customer_id);

drop policy if exists "Contracts insertable by coach" on public.contracts;
create policy "Contracts insertable by coach" on public.contracts
  for insert with check (auth.uid() = coach_id);

drop policy if exists "Contracts updatable by coach" on public.contracts;
create policy "Contracts updatable by coach" on public.contracts
  for update using (auth.uid() = coach_id);

create index if not exists idx_contracts_coach_customer on public.contracts(coach_id, customer_id);
create index if not exists idx_contracts_dates on public.contracts(start_date, end_date);

drop trigger if exists trg_contracts_updated_at on public.contracts;
create trigger trg_contracts_updated_at
before update on public.contracts
for each row execute function public.update_updated_at_column();

-- Notifications (lightweight)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Notifications readable by owner" on public.notifications;
create policy "Notifications readable by owner" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Notifications insertable by owner" on public.notifications;
create policy "Notifications insertable by owner" on public.notifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "Notifications updatable by owner" on public.notifications;
create policy "Notifications updatable by owner" on public.notifications
  for update using (auth.uid() = user_id);

create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);

-- Helper: compute and record payout when a contract ends
create or replace function public.create_payout_for_contract()
returns trigger
language plpgsql
security definer
set search_path = public as $$
declare
  v_platform_fee integer;
  v_net integer;
  v_payout_id uuid;
begin
  -- Only act when contract moves to completed or expired and no payout exists
  if (TG_OP = 'UPDATE') and (new.status in ('completed','expired')) and new.payout_id is null then
    v_platform_fee := round(new.price_cents * new.platform_fee_rate);
    v_net := new.price_cents - v_platform_fee;
    insert into public.payouts (coach_id, amount_cents, platform_fee_cents, net_amount_cents, status, period_start, period_end)
    values (new.coach_id, new.price_cents, v_platform_fee, v_net, 'pending', new.start_date, new.end_date)
    returning id into v_payout_id;
    new.payout_id := v_payout_id;
    -- Notify both parties
    insert into public.notifications (user_id, type, title, body, data)
    values
      (new.coach_id, 'contract_ended', 'Contract ended', 'A coaching contract has ended. Payout will be processed.', jsonb_build_object('contract_id', new.id)),
      (new.customer_id, 'contract_ended', 'Contract ended', 'Your coaching period has ended. You can renew to continue.', jsonb_build_object('contract_id', new.id));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_contracts_payout on public.contracts;
create trigger trg_contracts_payout
after update on public.contracts
for each row execute function public.create_payout_for_contract();

-- AI flag and profile trial tracking
alter table if exists public.programs
  add column if not exists is_ai_generated boolean not null default false;

alter table if exists public.profiles
  add column if not exists has_used_trial boolean not null default false;

create or replace function public.mark_trial_used()
returns trigger as $$
begin
  if new.plan = 'trial' then
    new.has_used_trial := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mark_trial_used on public.profiles;
create trigger trg_mark_trial_used
before insert or update on public.profiles
for each row
execute function public.mark_trial_used();

-- daily_checkins and payouts
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

drop policy if exists "Daily checkins are viewable by owner" on public.daily_checkins;
create policy "Daily checkins are viewable by owner" on public.daily_checkins
  for select using (auth.uid() = user_id);

drop policy if exists "Daily checkins are insertable by owner" on public.daily_checkins;
create policy "Daily checkins are insertable by owner" on public.daily_checkins
  for insert with check (auth.uid() = user_id);

drop policy if exists "Daily checkins are updatable by owner" on public.daily_checkins;
create policy "Daily checkins are updatable by owner" on public.daily_checkins
  for update using (auth.uid() = user_id);

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

drop policy if exists "Payouts are viewable by coach" on public.payouts;
create policy "Payouts are viewable by coach" on public.payouts
  for select using (auth.uid() = coach_id);

-- coach_checkins and customer_states
create table if not exists public.coach_checkins (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  message text,
  due_date date,
  status text not null default 'open' check (status in ('open','completed','dismissed')),
  created_at timestamptz not null default now()
);
alter table public.coach_checkins enable row level security;

drop policy if exists "Coach checkins readable by coach or customer" on public.coach_checkins;
create policy "Coach checkins readable by coach or customer" on public.coach_checkins
for select using (auth.uid() = coach_id or auth.uid() = customer_id);

drop policy if exists "Coach checkins insertable by coach" on public.coach_checkins;
create policy "Coach checkins insertable by coach" on public.coach_checkins
for insert with check (auth.uid() = coach_id);

drop policy if exists "Coach checkins updatable by coach or customer" on public.coach_checkins;
create policy "Coach checkins updatable by coach or customer" on public.coach_checkins
for update using (auth.uid() = coach_id or auth.uid() = customer_id);

drop materialized view if exists public.customer_states;
create materialized view public.customer_states as
select p.id as customer_id,
  -- Program coverage
  (pr.last_program is null) as missing_program,
  -- Engagement and feedback
  coalesce(cc.any_open, false) as needs_feedback,
  -- Platform subscription expiry (Stripe subscription)
  (p.plan_expiry is not null and p.plan_expiry::date <= (now() at time zone 'utc')::date + interval '5 days') as soon_to_expire,
  -- Off-track if no recent checkins in 3 days
  (dc.date is null or dc.date < (now() at time zone 'utc')::date - interval '3 days') as off_track,
  -- Platform subscription expired
  (p.plan_expiry is not null and p.plan_expiry::date < (now() at time zone 'utc')::date) as program_expired,
  -- Contract signals
  exists (
    select 1 from contracts c
    where c.customer_id = p.id
      and c.status = 'active'
      and (c.end_date <= (now() at time zone 'utc')::date + interval '5 days')
  ) as contract_expiring_soon,
  exists (
    select 1 from contracts c
    where c.customer_id = p.id
      and c.status = 'expired'
  ) as contract_expired,
  exists (
    select 1 from programs pg
    where pg.assigned_to = p.id
  ) as on_track
from profiles p
left join (
  select assigned_to as customer_id, max(updated_at) as last_program
  from programs where assigned_to is not null
  group by assigned_to
) pr on pr.customer_id = p.id
left join (
  select user_id, max(date) as date from daily_checkins group by user_id
) dc on dc.user_id = p.id
left join (
  select customer_id, max(created_at) as last_checkin,
         bool_or(status = 'open') as any_open
  from coach_checkins
  group by customer_id
) cc on cc.customer_id = p.id
where p.role = 'customer';

create index if not exists idx_customer_states_customer_id on public.customer_states(customer_id);

-- Renewal prompts (5 days before contract end)
drop view if exists public.renewal_prompts;
create view public.renewal_prompts as
select c.id as contract_id,
       c.coach_id,
       c.customer_id,
       c.end_date,
       greatest((c.end_date - interval '5 days')::date, (now() at time zone 'utc')::date) as prompt_from
from public.contracts c
where c.status = 'active'
  and c.end_date <= (now() at time zone 'utc')::date + interval '5 days';

-- program_entries
create table if not exists public.program_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  date date not null default (now() at time zone 'utc')::date,
  type text not null check (type in ('fitness','nutrition','mental')),
  notes text,
  data jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, program_id, date)
);

alter table public.program_entries enable row level security;

drop policy if exists "Entries readable by owner" on public.program_entries;
create policy "Entries readable by owner" on public.program_entries
  for select using (auth.uid() = user_id);

drop policy if exists "Entries readable by coach of customer" on public.program_entries;
create policy "Entries readable by coach of customer" on public.program_entries
  for select using (
    public.is_coach_customer_relationship(auth.uid(), user_id)
  );

drop policy if exists "Entries writeable by owner" on public.program_entries;
create policy "Entries writeable by owner" on public.program_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Entries updatable by owner" on public.program_entries;
create policy "Entries updatable by owner" on public.program_entries
  for update using (auth.uid() = user_id);

-- Coach blog + price range
alter table if exists public.profiles
  add column if not exists price_min_cents integer,
  add column if not exists price_max_cents integer;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  introduction text,
  content text,
  category text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;

drop policy if exists "Blog readable by anyone" on public.blog_posts;
drop policy if exists "Blog readable by customers and coaches" on public.blog_posts;
create policy "Blog readable by customers and coaches" on public.blog_posts
  for select using (
    auth.role() = 'authenticated' and (
      public.has_role(auth.uid(), 'coach') or public.has_role(auth.uid(), 'customer')
    )
  );

drop policy if exists "Blog insertable by coach" on public.blog_posts;
create policy "Blog insertable by coach" on public.blog_posts
  for insert with check (auth.uid() = coach_id);

drop policy if exists "Blog updatable by owner" on public.blog_posts;
create policy "Blog updatable by owner" on public.blog_posts
  for update using (auth.uid() = coach_id);

drop policy if exists "Blog deletable by owner" on public.blog_posts;
create policy "Blog deletable by owner" on public.blog_posts
  for delete using (auth.uid() = coach_id);

drop trigger if exists set_blog_updated_at on public.blog_posts;
create trigger set_blog_updated_at
before update on public.blog_posts
for each row execute procedure public.update_updated_at_column();

-- Security utilities & RLS tightening
create or replace function public.is_coach_customer_relationship(coach_user_id uuid, customer_user_id uuid)
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles 
    where id = customer_user_id 
    and coach_id = coach_user_id
  );
$$;

-- onboarding_details visibility
drop policy if exists "Coaches can view all onboarding details" on public.onboarding_details;
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Coaches can view their assigned customers onboarding details' and tablename = 'onboarding_details'
  ) then
    create policy "Coaches can view their assigned customers onboarding details"
    on public.onboarding_details
    for select
    using (
      auth.uid() = user_id or 
      public.is_coach_customer_relationship(auth.uid(), user_id)
    );
  end if;
end $$;

-- Public coach profile helper and policies
create or replace function public.can_view_coach_public_profile(viewer_id uuid, coach_id uuid)
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select exists (
    select 1 
    from public.profiles 
    where id = coach_id 
    and role = 'coach'
  );
$$;

drop policy if exists "Public can view coach profiles" on public.profiles;
drop policy if exists "Public can view coach public profiles only" on public.profiles;
create policy "Public can view coach public profiles only" 
on public.profiles 
for select 
using (
  role = 'coach' and (
    auth.uid() = id or 
    public.can_view_coach_public_profile(auth.uid(), id)
  )
);

-- app_role type and user_roles table
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'coach', 'customer');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  assigned_at timestamptz default now(),
  assigned_by uuid references auth.users(id),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function public.get_primary_user_role(_user_id uuid)
returns text
language sql
stable security definer
set search_path = public
as $$
  select coalesce(
    (select role::text from public.user_roles where user_id = _user_id limit 1),
    (select role from public.profiles where id = _user_id)
  );
$$;

drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can manage all roles" on public.user_roles;
create policy "Admins can manage all roles"
on public.user_roles
for all
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.assign_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, assigned_by)
  values (new.id, new.role::app_role, new.id)
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  after insert or update of role on public.profiles
  for each row
  execute function public.assign_user_role();

-- Public profiles RPC
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

-- Add location field to onboarding_details if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'onboarding_details'
      and column_name = 'location'
  ) then
    alter table public.onboarding_details
      add column location text;
  end if;
end $$;

-- Weight tracking table for progress monitoring
create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  date date not null default (now() at time zone 'utc')::date,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Photo progress table for progression photos
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  date date not null default (now() at time zone 'utc')::date,
  notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.weight_entries enable row level security;
alter table public.progress_photos enable row level security;

-- Weight entries policies
create policy "Weight entries are viewable by owner" on public.weight_entries
  for select using (auth.uid() = user_id);

create policy "Weight entries are insertable by owner" on public.weight_entries
  for insert with check (auth.uid() = user_id);

create policy "Weight entries are updatable by owner" on public.weight_entries
  for update using (auth.uid() = user_id);

create policy "Weight entries are deletable by owner" on public.weight_entries
  for delete using (auth.uid() = user_id);

-- Progress photos policies
create policy "Progress photos are viewable by owner" on public.progress_photos
  for select using (auth.uid() = user_id);

create policy "Progress photos are insertable by owner" on public.progress_photos
  for insert with check (auth.uid() = user_id);

create policy "Progress photos are updatable by owner" on public.progress_photos
  for update using (auth.uid() = user_id);

create policy "Progress photos are deletable by owner" on public.progress_photos
  for delete using (auth.uid() = user_id);

-- Indexes for better performance
create index if not exists idx_weight_entries_user_id_date on public.weight_entries(user_id, date desc);
create index if not exists idx_progress_photos_user_id_date on public.progress_photos(user_id, date desc);

-- End of consolidated migration



-- Customers table: stores basic customer identity and onboarding linkage
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

-- Policies: users can see and manage their own customer record
drop policy if exists "Customers readable by owner" on public.customers;
create policy "Customers readable by owner"
  on public.customers
  for select using (auth.uid() = id);

drop policy if exists "Customers upsertable by owner" on public.customers;
create policy "Customers upsertable by owner"
  on public.customers
  for insert with check (auth.uid() = id);

drop policy if exists "Customers updatable by owner" on public.customers;
create policy "Customers updatable by owner"
  on public.customers
  for update using (auth.uid() = id);

drop trigger if exists update_customers_updated_at on public.customers;
create trigger update_customers_updated_at
before update on public.customers
for each row
execute function public.update_updated_at_column();