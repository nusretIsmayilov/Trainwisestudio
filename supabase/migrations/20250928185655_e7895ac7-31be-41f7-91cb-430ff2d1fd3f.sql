-- Create enum for request status
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create coach_requests table
CREATE TABLE public.coach_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status request_status NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_customer_coach_request UNIQUE (customer_id, coach_id)
);

-- Enable RLS
ALTER TABLE public.coach_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_requests
CREATE POLICY "Customers can insert their own requests" 
ON public.coach_requests 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view their own requests" 
ON public.coach_requests 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Coaches can view requests sent to them" 
ON public.coach_requests 
FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can update requests sent to them" 
ON public.coach_requests 
FOR UPDATE 
USING (auth.uid() = coach_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_coach_requests_updated_at
BEFORE UPDATE ON public.coach_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow customers to view coach profiles for exploration
CREATE POLICY "Users can view coach profiles" 
ON public.profiles 
FOR SELECT 
USING (role = 'coach' OR auth.uid() = id);