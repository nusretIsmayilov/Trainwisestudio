set search_path = public;

-- Add is_published column to blog_posts table
alter table if exists public.blog_posts
  add column if not exists is_published boolean not null default false;

-- Create storage bucket for blog covers
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-covers',
  'blog-covers',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Create RLS policies for blog-covers bucket
-- Policy 1: Authenticated users can upload blog covers to their own folder
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Users can upload blog covers'
  ) then
    create policy "Users can upload blog covers" on storage.objects
    for insert with check (
      bucket_id = 'blog-covers' 
      and auth.uid() is not null
      and (
        name like 'blog_covers/' || auth.uid()::text || '/%'
        or name like 'blog_content/' || auth.uid()::text || '/%'
      )
    );
  end if;
end $$;

-- Policy 2: Users can update their own blog covers
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Users can update blog covers'
  ) then
    create policy "Users can update blog covers" on storage.objects
    for update using (
      bucket_id = 'blog-covers' 
      and auth.uid() is not null
      and (
        name like 'blog_covers/' || auth.uid()::text || '/%'
        or name like 'blog_content/' || auth.uid()::text || '/%'
      )
    );
  end if;
end $$;

-- Policy 3: Users can delete their own blog covers
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Users can delete blog covers'
  ) then
    create policy "Users can delete blog covers" on storage.objects
    for delete using (
      bucket_id = 'blog-covers' 
      and auth.uid() is not null
      and (
        name like 'blog_covers/' || auth.uid()::text || '/%'
        or name like 'blog_content/' || auth.uid()::text || '/%'
      )
    );
  end if;
end $$;

-- Policy 4: Blog cover images are publicly viewable
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
    and tablename = 'objects' 
    and policyname = 'Blog covers are publicly viewable'
  ) then
    create policy "Blog covers are publicly viewable" on storage.objects
    for select using (bucket_id = 'blog-covers');
  end if;
end $$;

