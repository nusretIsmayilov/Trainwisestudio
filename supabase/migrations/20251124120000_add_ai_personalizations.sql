set search_path = public;

create table if not exists public.ai_personalizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_type text not null default 'subscription_onboarding',
  plans_generated boolean not null default false,
  insights jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  last_analysis_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_personalizations_user_id_idx
  on public.ai_personalizations(user_id);

alter table public.ai_personalizations enable row level security;

drop policy if exists "AI personalization readable by owner" on public.ai_personalizations;
create policy "AI personalization readable by owner"
on public.ai_personalizations
for select
using (auth.uid() = user_id);

drop policy if exists "AI personalization insertable by owner" on public.ai_personalizations;
create policy "AI personalization insertable by owner"
on public.ai_personalizations
for insert
with check (auth.uid() = user_id);

drop policy if exists "AI personalization updatable by owner" on public.ai_personalizations;
create policy "AI personalization updatable by owner"
on public.ai_personalizations
for update
using (auth.uid() = user_id);

create or replace function public.set_ai_personalizations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_personalizations_updated_at on public.ai_personalizations;
create trigger set_ai_personalizations_updated_at
before update on public.ai_personalizations
for each row
execute function public.set_ai_personalizations_updated_at();


