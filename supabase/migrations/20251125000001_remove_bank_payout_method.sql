set search_path = public;

-- Remove 'bank' from payout_method check constraint and update default to 'paypal'
alter table public.coach_payout_settings
  drop constraint if exists coach_payout_settings_payout_method_check;

alter table public.coach_payout_settings
  add constraint coach_payout_settings_payout_method_check
  check (payout_method in ('paypal', 'stripe'));

-- Update default value to 'paypal' instead of 'bank'
alter table public.coach_payout_settings
  alter column payout_method set default 'paypal';

-- For any existing records with 'bank' method, update them to 'paypal'
update public.coach_payout_settings
  set payout_method = 'paypal'
  where payout_method = 'bank';

