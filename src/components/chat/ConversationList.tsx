import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ConversationWithProfiles } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: ConversationWithProfiles[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userRole?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  userRole
}) => {
  const { user } = useAuth();
  const [clientStatuses, setClientStatuses] = useState<Record<string, boolean>>({});

  // Check if customers are actual clients vs just requesters
  useEffect(() => {
    if (userRole !== 'coach' || !user) return;

    const checkClientStatuses = async () => {
      const customerIds = conversations
        .filter(conv => conv.customer_id !== user.id)
        .map(conv => conv.customer_id);

      if (customerIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, coach_id')
          .in('id', customerIds);

        if (error) throw error;

        const statuses: Record<string, boolean> = {};
        data.forEach(profile => {
          statuses[profile.id] = profile.coach_id === user.id;
        });
        setClientStatuses(statuses);
      } catch (error) {
        console.error('Error checking client statuses:', error);
      }
    };

    checkClientStatuses();
  }, [conversations, userRole, user]);

  const getOtherUser = (conversation: ConversationWithProfiles) => {
    const other = user?.id === conversation.coach_id ? conversation.customer : conversation.coach;
    // DEBUG: Log which participant we resolved for this row
    console.debug('[ConversationList] Other user resolved:', {
      conversationId: conversation.id,
      selected: user?.id === conversation.coach_id ? 'customer' : 'coach',
      id: other?.id,
      full_name: other?.full_name,
      email: other?.email,
      avatar_url: other?.avatar_url,
    });
    return other;
  };

  const getDisplayName = (fullName?: string, email?: string) => {
    if (fullName && fullName.trim().length > 0) return fullName;
    if (email && email.includes('@')) return email.split('@')[0];
    return 'Unknown User';
  };

  const getStatusBadge = (conversation: ConversationWithProfiles) => {
    if (userRole !== 'coach') return null;

    const otherUser = getOtherUser(conversation);
    if (!otherUser) return null;

    const isClient = clientStatuses[otherUser.id] || false;
    
    return (
      <Badge variant={isClient ? "default" : "secondary"} className="text-xs">
        {isClient ? "Client" : "Requester"}
      </Badge>
    );
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="text-center text-muted-foreground">
          <p>No conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border">
        <h2 className="text-base md:text-lg font-semibold">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const isSelected = selectedId === conversation.id;
          
          return (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "p-3 md:p-4 cursor-pointer border-b border-border hover:bg-accent/50 transition-colors",
                isSelected && "bg-accent"
              )}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  <AvatarImage src={otherUser?.avatar_url || undefined} />
                  <AvatarFallback>
                    {otherUser?.full_name?.split(' ').map(n => n[0]).join('') || (otherUser?.email ? otherUser.email[0].toUpperCase() : '?')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-xs sm:text-sm truncate">
                      {getDisplayName(otherUser?.full_name, otherUser?.email)}
                    </h3>
                    {getStatusBadge(conversation)}
                  </div>
                  
                  {conversation.last_message && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-1">
                      {conversation.last_message.message_type === 'offer' 
                        ? '💰 Sent an offer' 
                        : conversation.last_message.content}
                    </p>
                  )}
                  
                  {conversation.last_message && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { 
                        addSuffix: true 
                      })}
                    </p>
                  )}
                </div>
                
                {conversation.unread_count > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <Badge variant="destructive" className="w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs rounded-full p-0 flex items-center justify-center">
                      {conversation.unread_count}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};