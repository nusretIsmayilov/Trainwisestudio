-- Add stripe_subscription_id to profiles for tracking active Stripe subscription id
alter table if exists public.profiles
  add column if not exists stripe_subscription_id text;

-- Optional index to lookup by subscription id quickly
create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id);


