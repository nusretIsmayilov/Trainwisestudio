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
