-- Remove any existing unique constraint and add a new one that allows re-requests after rejection
-- First, check if the constraint exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_customer_coach_request' 
        AND table_name = 'coach_requests'
    ) THEN
        ALTER TABLE public.coach_requests DROP CONSTRAINT unique_customer_coach_request;
    END IF;
END $$;

-- Create a new unique constraint that only applies to pending and accepted requests
-- This allows customers to send new requests after rejection
CREATE UNIQUE INDEX unique_active_coach_request 
ON public.coach_requests (customer_id, coach_id) 
WHERE status IN ('pending', 'accepted');