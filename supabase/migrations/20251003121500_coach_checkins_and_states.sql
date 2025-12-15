set search_path = public;

-- Coach-initiated check-ins / feedback prompts
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

create policy if not exists "Coach checkins readable by coach or customer" on public.coach_checkins
for select using (auth.uid() = coach_id or auth.uid() = customer_id);

create policy if not exists "Coach checkins insertable by coach" on public.coach_checkins
for insert with check (auth.uid() = coach_id);

create policy if not exists "Coach checkins updatable by coach or customer" on public.coach_checkins
for update using (auth.uid() = coach_id or auth.uid() = customer_id);

-- Customer state materialized view for quick insights
drop materialized view if exists public.customer_states;
create materialized view public.customer_states as
select p.id as customer_id,
  case when pr.id is null then true else false end as missing_program,
  case when cc.id is not null and cc.status = 'open' then true else false end as needs_feedback,
  case when p.plan_expiry is not null and p.plan_expiry::date <= (now() at time zone 'utc')::date + interval '7 days' then true else false end as soon_to_expire,
  case when dc.date is null or dc.date < (now() at time zone 'utc')::date - interval '3 days' then true else false end as off_track,
  case when p.plan_expiry is not null and p.plan_expiry::date < (now() at time zone 'utc')::date then true else false end as program_expired
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
  select customer_id, max(created_at) as last_checkin, max(id) as id, max(status) as status from coach_checkins group by customer_id
) cc on cc.customer_id = p.id
where p.role = 'customer';

create index if not exists idx_customer_states_customer_id on public.customer_states(customer_id);


