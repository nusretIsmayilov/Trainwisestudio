set search_path = public;

-- Capture per-day program entries (completion logs)
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

create policy if not exists "Entries readable by owner" on public.program_entries
  for select using (auth.uid() = user_id);
create policy if not exists "Entries writeable by owner" on public.program_entries
  for insert with check (auth.uid() = user_id);
create policy if not exists "Entries updatable by owner" on public.program_entries
  for update using (auth.uid() = user_id);


