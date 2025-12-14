import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'offer' | 'system';
  metadata: any;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  coach_offer?: {
    id: string;
    price: number;
    duration_months: number;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    expires_at: string;
  };
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const { insert: queueMessageInsert } = useTableMutations('messages');
  const { insert: queueOfferInsert } = useTableMutations('coach_offers');
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          coach_offer:coach_offers!coach_offers_message_id_fkey(
            id,
            price,
            duration_months,
            status,
            expires_at
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Hide messages that are offer-type with rejected status
      const filtered = (data || []).filter((m: any) => {
        const isOffer = m.message_type === 'offer';
        const hasOfferRow = Boolean(m.coach_offer);
        const isRejected = isOffer && hasOfferRow && m.coach_offer.status === 'rejected';
        // Hide offer messages that are rejected OR whose coach_offers row is missing
        if (isOffer && (!hasOfferRow || isRejected)) return false;
        return true;
      });
      setMessages(filtered);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  const sendMessage = async (content: string, messageType: 'text' | 'offer' | 'system' = 'text', metadata = {}) => {
    if (!conversationId || !user) throw new Error('Missing conversation or user');

    try {
      // Use mutation queue for offline support and scalability
      try {
        await queueMessageInsert(
          {
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            message_type: messageType,
            metadata,
          },
          {
            invalidateQueries: conversationId ? [queryKeys.messages(conversationId)] : [],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: `temp_${Date.now()}`,
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: {
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
          },
        } as MessageWithSender;
        
        setMessages(prev => [...prev, optimisticData]);
        return optimisticData;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct insert:', queueError);
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            message_type: messageType,
            metadata
          })
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
          `)
          .single();

        if (error) throw error;
        
        setMessages(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const sendOffer = async (price: number, durationMonths: number, message: string) => {
    if (!conversationId || !user) throw new Error('Missing conversation or user');

    try {
      // First send the message
      const messageData = await sendMessage(message, 'offer', { 
        price, 
        duration_months: durationMonths 
      });

      // Get the conversation to find customer_id
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('customer_id')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Then create the offer using queue
      try {
        await queueOfferInsert(
          {
            message_id: messageData.id,
            coach_id: user.id,
            customer_id: conversation.customer_id,
            price,
            duration_months: durationMonths,
          },
          {
            invalidateQueries: conversationId ? [queryKeys.messages(conversationId)] : [],
          }
        );
        
        // Return optimistic offer data
        const offerData = {
          id: `temp_offer_${Date.now()}`,
          message_id: messageData.id,
          coach_id: user.id,
          customer_id: conversation.customer_id,
          price,
          duration_months: durationMonths,
          status: 'pending' as const,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        // Update the message in state to include offer data
        setMessages(prev => prev.map(msg => 
          msg.id === messageData.id 
            ? { ...msg, coach_offer: offerData }
            : msg
        ));
        
        return { message: messageData, offer: offerData };
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed for offer, falling back to direct insert:', queueError);
        const { data: offerData, error: offerError } = await supabase
          .from('coach_offers')
          .insert({
            message_id: messageData.id,
            coach_id: user.id,
            customer_id: conversation.customer_id,
            price,
            duration_months: durationMonths
          })
          .select()
          .single();

        if (offerError) throw offerError;

        // Update the message in state to include offer data
        setMessages(prev => prev.map(msg => 
          msg.id === messageData.id 
            ? { ...msg, coach_offer: offerData }
            : msg
        ));

        return { message: messageData, offer: offerData };
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!conversationId) return;

    // Set up real-time subscription for message changes (INSERT/DELETE/UPDATE)
    const channel = supabase.channel(`messages-${conversationId}`);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
            coach_offer:coach_offers!coach_offers_message_id_fkey(
              id,
              price,
              duration_months,
              status,
              expires_at
            )
          `)
          .eq('id', payload.new.id)
          .single()
          .then(({ data }) => {
            if (!data) return;
            const isOffer = data.message_type === 'offer';
            const hasOfferRow = Boolean(data.coach_offer);
            const isRejected = isOffer && hasOfferRow && data.coach_offer.status === 'rejected';
            // do not add rejected offers or orphan offer messages
            if (isOffer && (!hasOfferRow || isRejected)) return;
            setMessages(prev => [...prev, data]);
          });
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        const deletedId = (payload.old as any)?.id;
        if (deletedId) {
          setMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        const updatedId = (payload.new as any)?.id;
        if (updatedId) {
          supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
              coach_offer:coach_offers!coach_offers_message_id_fkey(
                id,
                price,
                duration_months,
                status,
                expires_at
              )
            `)
            .eq('id', updatedId)
            .single()
            .then(({ data }) => {
              if (!data) return;
              const isOffer = data.message_type === 'offer';
              const hasOfferRow = Boolean(data.coach_offer);
              const isRejected = isOffer && hasOfferRow && data.coach_offer.status === 'rejected';
              if (isOffer && (!hasOfferRow || isRejected)) {
                // remove rejected offers from the view
                setMessages(prev => prev.filter(m => m.id !== updatedId));
                return;
              }
              setMessages(prev => prev.map(m => (m.id === updatedId ? data : m)));
            });
        }
      }
    );

    // Listen for coach_offers status updates (e.g., when webhook marks offer as accepted)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'coach_offers',
      },
      (payload) => {
        const updatedOffer = payload.new as any;
        const offerId = updatedOffer.id;
        const messageId = updatedOffer.message_id;
        
        // If this offer is linked to a message in this conversation, refresh that message
        if (messageId) {
          (async () => {
            try {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
                  coach_offer:coach_offers!coach_offers_message_id_fkey(
                    id,
                    price,
                    duration_months,
                    status,
                    expires_at
                  )
                `)
                .eq('id', messageId)
                .single();
              
              if (error) throw error;
              if (!data) return;
              
              // Update the message in state with the new offer status
              setMessages(prev => prev.map(m => 
                m.id === messageId ? data : m
              ));
              console.log('[Realtime] Coach offer status updated', { offerId, status: updatedOffer.status });
            } catch (err) {
              console.error('[Realtime] Error refreshing message after offer update', err);
            }
          })();
        }
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages, user?.id]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendOffer,
    refetch: fetchMessages
  };
};