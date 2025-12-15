-- Create enum types for program status and category
CREATE TYPE program_status AS ENUM ('active', 'scheduled', 'draft', 'normal');
CREATE TYPE program_category AS ENUM ('fitness', 'nutrition', 'mental health');

-- Create programs table
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  status program_status NOT NULL DEFAULT 'draft',
  category program_category NOT NULL,
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_date timestamp with time zone,
  plan jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policies for coach access
CREATE POLICY "Coaches can view their own programs" 
ON public.programs 
FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create their own programs" 
ON public.programs 
FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own programs" 
ON public.programs 
FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own programs" 
ON public.programs 
FOR DELETE 
USING (auth.uid() = coach_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_programs_coach_id ON public.programs(coach_id);
CREATE INDEX idx_programs_status ON public.programs(status);
CREATE INDEX idx_programs_category ON public.programs(category);
CREATE INDEX idx_programs_assigned_to ON public.programs(assigned_to);