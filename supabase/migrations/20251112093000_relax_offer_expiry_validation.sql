-- Allow coach offer status updates after expiry while keeping pending offers constrained
set search_path = public;

create or replace function public.validate_coach_offer()
returns trigger
language plpgsql
as $$
begin
  if new.price < 10 or new.price > 10000 then
    raise exception 'Offer price must be between $10 and $10,000';
  end if;

  if new.duration_months < 1 or new.duration_months > 52 then
    raise exception 'Offer duration must be between 1 and 52 weeks';
  end if;

  -- Only enforce the expiry window while the offer is still pending.
  -- This lets webhooks or manual updates mark old offers as accepted/rejected after payment.
  if new.status = 'pending' and new.expires_at <= now() then
    raise exception 'Offer expiration date must be in the future';
  end if;

  return new;
end;
$$;

