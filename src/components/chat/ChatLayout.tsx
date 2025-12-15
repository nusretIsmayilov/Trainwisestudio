import React from 'react';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
//hello
interface ChatLayoutProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  selectedConversationId,
  onSelectConversation
}) => {
  const { conversations, loading } = useConversations();
  const { profile } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">{t('messages.loadingConversations')}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background w-full">
      {/* Conversation List - hide on mobile when conversation selected */}
      <div className={cn(
        "w-full md:w-64 lg:w-80 border-r border-border flex-shrink-0",
        selectedConversationId && "hidden md:block"
      )}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={onSelectConversation}
          userRole={profile?.role}
        />
      </div>

      {/* Chat View - hide on mobile when no conversation selected */}
      <div className={cn(
        "flex-1 flex flex-col",
        !selectedConversationId && "hidden md:flex"
      )}>
        {selectedConversationId ? (
          <ChatView 
            conversationId={selectedConversationId}
            userRole={profile?.role}
            onBack={() => onSelectConversation(null)}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">{t('messages.selectConversation')}</h3>
              <p>{t('messages.chooseConversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};