set search_path = public;

-- Coach price range fields
alter table if exists public.profiles
  add column if not exists price_min_cents integer,
  add column if not exists price_max_cents integer;

-- Coach blog posts
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

create policy if not exists "Blog readable by anyone" on public.blog_posts
  for select using (true);
create policy if not exists "Blog insertable by coach" on public.blog_posts
  for insert with check (auth.uid() = coach_id);
create policy if not exists "Blog updatable by owner" on public.blog_posts
  for update using (auth.uid() = coach_id);
create policy if not exists "Blog deletable by owner" on public.blog_posts
  for delete using (auth.uid() = coach_id);

create trigger set_blog_updated_at
before update on public.blog_posts
for each row execute procedure public.update_updated_at_column();


