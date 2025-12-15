-- Add AI generated flag to programs and one-time trial tracking to profiles
set search_path = public;

-- programs: ai flag
alter table if exists programs
  add column if not exists is_ai_generated boolean not null default false;

-- profiles: track if user has used free trial
alter table if exists profiles
  add column if not exists has_used_trial boolean not null default false;

-- Ensure plan/trial semantics: when plan is set to 'trial', also set has_used_trial = true via trigger
create or replace function mark_trial_used()
returns trigger as $$
begin
  if new.plan = 'trial' then
    new.has_used_trial := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mark_trial_used on profiles;
create trigger trg_mark_trial_used
before insert or update on profiles
for each row
execute function mark_trial_used();


