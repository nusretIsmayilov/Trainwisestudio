-- Fix Function Search Path Security Warning

-- Update validate_coach_offer function to set search_path
CREATE OR REPLACE FUNCTION public.validate_coach_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.price < 50 OR NEW.price > 10000 THEN
    RAISE EXCEPTION 'Offer price must be between $50 and $10,000';
  END IF;
  
  IF NEW.duration_months < 1 OR NEW.duration_months > 12 THEN
    RAISE EXCEPTION 'Offer duration must be between 1 and 12 months';
  END IF;
  
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Offer expiration date must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$;