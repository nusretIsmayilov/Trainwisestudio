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

      const filtered = (data || []).filter((m: any) => {
        const isOffer = m.message_type === 'offer';
        const hasOffer = Boolean(m.coach_offer);
        const isRejected = isOffer && hasOffer && m.coach_offer.status === 'rejected';
        if (isOffer && (!hasOffer || isRejected)) return false;
        return true;
      });

      setMessages(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  // ✅ TEXT MESSAGE (değişmedi)
  const sendMessage = async (
    content: string,
    messageType: 'text' | 'offer' | 'system' = 'text',
    metadata = {}
  ) => {
    if (!conversationId || !user) throw new Error('Missing conversation or user');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    setMessages(prev => [...prev, data]);
    return data as MessageWithSender;
  };

  // 🔥 ASIL DÜZELTİLEN KISIM
  const sendOffer = async (
    price: number,
    durationMonths: number,
    message: string
  ) => {
    if (!conversationId || !user) throw new Error('Missing conversation or user');

    // 1️⃣ MESAJI GERÇEK OLARAK OLUŞTUR
    const messageData = await sendMessage(
      message,
      'offer',
      { price, duration_months: durationMonths }
    );

    // 2️⃣ CUSTOMER ID BUL
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('customer_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // 3️⃣ OFFER’I GERÇEK MESSAGE ID İLE OLUŞTUR ✅
    const { data: offerData, error: offerError } = await supabase
      .from('coach_offers')
      .insert({
        message_id: messageData.id, // ✅ GERÇEK ID
        coach_id: user.id,
        customer_id: conversation.customer_id,
        price,
        duration_months: durationMonths,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select()
      .single();

    if (offerError) throw offerError;

    // 4️⃣ MESSAGE STATE GÜNCELLE
    setMessages(prev =>
      prev.map(m =>
        m.id === messageData.id
          ? { ...m, coach_offer: offerData }
          : m
      )
    );

    return { message: messageData, offer: offerData };
  };

  useEffect(() => {
    fetchMessages();
    if (!conversationId) return;

    const channel = supabase.channel(`messages-${conversationId}`);

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      fetchMessages
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'coach_offers' },
      fetchMessages
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendOffer,
    refetch: fetchMessages,
  };
};
