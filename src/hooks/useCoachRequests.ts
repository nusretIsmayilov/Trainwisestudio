// src/hooks/useCoachRequests.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CoachRequestWithCustomer {
  id: string;
  customer_id: string;
  coach_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    plan: string;
    avatar_url: string;
  };
}

export const useCoachRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CoachRequestWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) {
      console.log('useCoachRequests: No user found');
      return;
    }

    console.log('useCoachRequests: Fetching requests for coach:', user.id);
    try {
      const { data, error } = await supabase
        .from('coach_requests')
        .select(`
          *,
          customer:profiles!customer_id(
            id,
            full_name,
            email,
            plan,
            avatar_url
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('useCoachRequests: Query result:', { data, error });

      if (error) throw error;
      
      const requestsData = data as CoachRequestWithCustomer[] || [];
      console.log('useCoachRequests: Setting requests:', requestsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const acceptRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return false;

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('coach_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Update customer's coach_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ coach_id: request.coach_id })
        .eq('id', request.customer_id);

      if (profileError) throw profileError;

      // Ensure a conversation exists between coach and customer
      try {
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('coach_id', request.coach_id)
          .eq('customer_id', request.customer_id)
          .maybeSingle();

        let conversationId = existing?.id as string | undefined;
        if (!conversationId) {
          const { data: created } = await supabase
            .from('conversations')
            .insert({ coach_id: request.coach_id, customer_id: request.customer_id, title: 'New coaching chat' })
            .select('id')
            .single();
          conversationId = created?.id;
        }

        // Send a welcome system message
        if (conversationId) {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: request.coach_id,
            content: 'Welcome aboard! I\'m excited to work with you. Feel free to share your goals here.',
            type: 'system',
          });
        }
      } catch {}

      // Create a coach feedback prompt for this customer
      try {
        await supabase.from('coach_checkins').insert({
          coach_id: request.coach_id,
          customer_id: request.customer_id,
          message: 'Welcome! Share your progress at week 1.',
          due_date: new Date().toISOString().slice(0,10),
        });
      } catch {}

      // Remove from pending requests
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // Show success message
      console.log('Request accepted successfully for customer:', request.customer_id);
      
      // Refresh the requests list to ensure UI is updated
      await fetchRequests();
      
      return true;
    } catch (error) {
      console.error('Error accepting request:', error);
      return false;
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('coach_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Remove from pending requests
      setRequests(prev => prev.filter(r => r.id !== requestId));
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      return false;
    }
  };

  return {
    requests,
    loading,
    acceptRequest,
    rejectRequest,
    refreshRequests: fetchRequests,
  };
};