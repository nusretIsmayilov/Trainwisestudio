import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface ConversationWithProfiles {
  id: string;
  coach_id: string;
  customer_id: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  coach?: {
    id: string;
    full_name: string;
    avatar_url: string;
    email?: string;
  };
  customer?: {
    id: string;
    full_name: string;
    avatar_url: string;
    email?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
  };
  unread_count?: number;
}

export const useConversations = () => {
  const { user, profile } = useAuth();
  const { insert: queueInsert } = useTableMutations('conversations');
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // NOTE: Some RLS policies may block direct joins on profiles.
      // We fetch bare conversations first, then hydrate participants via RPC.
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`coach_id.eq.${user.id},customer_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Fetch last messages for each conversation
      const conversationsWithMessages = await Promise.all(
        convs.map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, message_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          return {
            ...conv,
            last_message: lastMessage
          };
        })
      );

      // Get unique participant IDs from conversations
      const coachIds = Array.from(new Set(conversationsWithMessages.map(c => c.coach_id)));
      const customerIds = Array.from(new Set(conversationsWithMessages.map(c => c.customer_id)));
      const allIds = Array.from(new Set([...coachIds, ...customerIds]));

      // Try direct profiles table query first
      let profilesMapArr: any[] = [];
      let profilesError: any = null;
      
      const { data: directProfiles, error: directError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', allIds);
      
      
      if (directError) {
        console.warn('[useConversations] Direct profiles query failed, trying RPC fallback:', directError);
        // Fallback to RPC if direct query fails (RLS might be blocking)
        const { data: rpcProfiles, error: rpcError } = await supabase
          .rpc('get_public_profiles', { ids: allIds });
        
        
        if (rpcError) {
          console.error('[useConversations] Both direct and RPC queries failed:', { directError, rpcError });
          throw directError; // Use the first error
        }
        
        profilesMapArr = rpcProfiles || [];
        profilesError = rpcError;
      } else {
        profilesMapArr = directProfiles || [];
        profilesError = directError;
      }
      
      if (profilesError) {
        console.error('[useConversations] Profiles query error:', profilesError);
        throw profilesError;
      }

      const profilesById: Record<string, { id: string; full_name?: string; avatar_url?: string; email?: string }> = {};
      (profilesMapArr || []).forEach((p: any) => { 
        profilesById[p.id] = p;
      });
      

      const data = conversationsWithMessages.map(c => ({
        ...c,
        coach: profilesById[c.coach_id] || null,
        customer: profilesById[c.customer_id] || null,
      }));


      // Process conversations to add unread count and deduplicate
      const processedConversations = await Promise.all(data.map(async (conv) => {
        // Calculate unread count for this conversation
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id) // Messages not from current user
          .gt('created_at', conv.updated_at); // Messages after last conversation update

        const unreadCount = unreadMessages?.length || 0;

        return {
          ...conv,
          unread_count: unreadCount
        };
      }));

      // DEBUG: Check for duplicates before deduplication
      const conversationIds = processedConversations.map(c => c.id);
      const uniqueIds = new Set(conversationIds);
      if (conversationIds.length !== uniqueIds.size) {
        console.warn('[useConversations] Found duplicate conversations:', {
          total: conversationIds.length,
          unique: uniqueIds.size,
          duplicates: conversationIds.filter((id, index) => conversationIds.indexOf(id) !== index)
        });
      }

      // Merge conversations with the same participant (same other user)
      const mergedConversations = processedConversations.reduce((acc, conv) => {
        const otherUserId = user?.id === conv.coach_id ? conv.customer_id : conv.coach_id;
        const existing = acc.find(c => {
          const existingOtherUserId = user?.id === c.coach_id ? c.customer_id : c.coach_id;
          return existingOtherUserId === otherUserId;
        });

        if (!existing) {
          acc.push(conv);
        } else {
          // Merge with existing conversation - keep the one with the most recent activity
          const existingLastMessage = existing.last_message?.created_at || existing.updated_at;
          const currentLastMessage = conv.last_message?.created_at || conv.updated_at;
          
          if (new Date(currentLastMessage) > new Date(existingLastMessage)) {
            // Replace with more recent conversation
            const index = acc.findIndex(c => {
              const existingOtherUserId = user?.id === c.coach_id ? c.customer_id : c.coach_id;
              return existingOtherUserId === otherUserId;
            });
            acc[index] = conv;
          }
        }
        return acc;
      }, [] as typeof processedConversations);


      setConversations(mergedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (coachId: string, customerId: string) => {
    try {
      // Use mutation queue for offline support and scalability
      try {
        await queueInsert(
          {
            coach_id: coachId,
            customer_id: customerId,
          },
          {
            invalidateQueries: [
              queryKeys.conversations(coachId),
              queryKeys.conversations(customerId),
            ],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: `temp_${Date.now()}`,
          coach_id: coachId,
          customer_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
        
        setConversations(prev => [optimisticData, ...prev]);
        return optimisticData;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct insert:', queueError);
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            coach_id: coachId,
            customer_id: customerId
          })
          .select(`
            *,
            coach:profiles!conversations_coach_id_fkey(id, full_name, avatar_url, email),
            customer:profiles!conversations_customer_id_fkey(id, full_name, avatar_url, email)
          `)
          .single();

        if (error) throw error;
        
        setConversations(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const getOrCreateConversation = async (coachId: string, customerId: string) => {
    try {
      // First try to find existing conversation
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select(`
          *,
          coach:profiles!conversations_coach_id_fkey(id, full_name, avatar_url, email),
          customer:profiles!conversations_customer_id_fkey(id, full_name, avatar_url, email)
        `)
        .eq('coach_id', coachId)
        .eq('customer_id', customerId)
        .single();

      if (existing && !findError) {
        return existing;
      }

      // Create new conversation if not found
      return await createConversation(coachId, customerId);
    } catch (err) {
      console.error('Error getting or creating conversation:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
    getOrCreateConversation
  };
};