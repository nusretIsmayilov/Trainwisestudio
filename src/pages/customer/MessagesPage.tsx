import React, { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { useIsMobile } from '@/hooks/use-mobile';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const isMobile = useIsMobile();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationId || null
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { conversations, loading, refetch: refetchConversations } = useConversations();

  // Listen for offer status updates from the global StripeSyncHandler
  // The global handler processes the payment, but we need to refetch conversations here
  useEffect(() => {
    const handleOfferStatusUpdate = async (event: CustomEvent) => {
      console.log('[Frontend] MessagesPage - offer status updated event received', event.detail);
      setIsProcessingPayment(false);
      await refetchConversations();
    };

    window.addEventListener('offer-status-updated', handleOfferStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('offer-status-updated', handleOfferStatusUpdate as EventListener);
    };
  }, [refetchConversations]);

  // Auto-open most recent conversation if no specific conversation is selected (desktop only)
  // BUT only if we're not processing a payment redirect
  useEffect(() => {
    if (
      !isProcessingPayment &&
      !conversationId && 
      !loading && 
      conversations.length > 0 && 
      !selectedConversationId && 
      !isMobile
    ) {
      // Find the most recent conversation (conversations are already sorted by updated_at desc)
      const mostRecentConversation = conversations[0];
      if (mostRecentConversation) {
        setSelectedConversationId(mostRecentConversation.id);
        navigate(`/customer/messages/${mostRecentConversation.id}`);
      }
    }
  }, [conversationId, loading, conversations, selectedConversationId, navigate, isMobile, isProcessingPayment]);

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversationId(id);
    if (id) {
      navigate(`/customer/messages/${id}`);
    } else {
      navigate('/customer/messages');
    }
  };

  return (
    <div className="h-full">
      <ChatLayout
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
      />
    </div>
  );
};

export default MessagesPage;