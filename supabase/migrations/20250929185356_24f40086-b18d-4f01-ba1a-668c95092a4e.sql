-- Create conversation status enum
CREATE TYPE conversation_status AS ENUM ('active', 'archived');

-- Create message type enum  
CREATE TYPE message_type AS ENUM ('text', 'offer', 'system');

-- Create offer status enum
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Create conversations table
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status conversation_status NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(coach_id, customer_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create coach_offers table
CREATE TABLE public.coach_offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price decimal(10,2) NOT NULL,
    duration_months integer NOT NULL,
    status offer_status NOT NULL DEFAULT 'pending',
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = coach_id OR auth.uid() = customer_id);

CREATE POLICY "Coaches can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = coach_id OR auth.uid() = customer_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
        AND (c.coach_id = auth.uid() OR c.customer_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
        AND (c.coach_id = auth.uid() OR c.customer_id = auth.uid())
    )
);

-- RLS policies for coach_offers
CREATE POLICY "Users can view offers they're involved in"
ON public.coach_offers FOR SELECT
USING (auth.uid() = coach_id OR auth.uid() = customer_id);

CREATE POLICY "Coaches can create offers"
ON public.coach_offers FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update offers they're involved in"
ON public.coach_offers FOR UPDATE
USING (auth.uid() = coach_id OR auth.uid() = customer_id);

-- Create indexes for performance
CREATE INDEX idx_conversations_coach_id ON public.conversations(coach_id);
CREATE INDEX idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_coach_offers_status ON public.coach_offers(status);

-- Create trigger for updating timestamps
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_offers_updated_at
    BEFORE UPDATE ON public.coach_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();