import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { OfferComposer } from './OfferComposer';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ChatViewProps {
  conversationId: string;
  userRole?: string;
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversationId,
  userRole,
  onBack
}) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, sendOffer, refetch } = useMessages(conversationId);
  const [showOfferComposer, setShowOfferComposer] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for offer status updates and refetch messages
  useEffect(() => {
    const handleOfferUpdate = () => {
      console.log('[ChatView] Offer status updated event received, refetching messages');
      refetch();
    };
    
    window.addEventListener('offer-status-updated', handleOfferUpdate);
    return () => {
      window.removeEventListener('offer-status-updated', handleOfferUpdate);
    };
  }, [refetch]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setSending(true);
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSendFile = async (file: File) => {
    setSending(true);
    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          await sendMessage(`[FILE:${file.name}:${base64}]`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error("Failed to send file. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSendOffer = async (price: number, duration: number, message: string) => {
    setSending(true);
    try {
      await sendOffer(price, duration, message);
      setShowOfferComposer(false);
      toast.success("Your coaching offer has been sent successfully.");
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error("Failed to send offer. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header with Back Button */}
      {onBack && (
        <div className="md:hidden border-b border-border p-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-medium">Conversation</h2>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-5">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              userRole={userRole}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Offer Composer */}
      {showOfferComposer && (
        <div className="border-t border-border p-2 sm:p-3 md:p-4">
          <OfferComposer
            onSend={handleSendOffer}
            onCancel={() => setShowOfferComposer(false)}
            sending={sending}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-border p-2 sm:p-3 md:p-4">
        <div className="flex gap-1 sm:gap-2">
          {userRole === 'coach' && !showOfferComposer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOfferComposer(true)}
              className="flex-shrink-0"
            >
              <DollarSign className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Send Offer</span>
            </Button>
          )}
          <div className="flex-1">
            <MessageInput
              onSend={handleSendMessage}
              onSendFile={handleSendFile}
              disabled={sending}
              placeholder={sending ? "Sending..." : "Type a message..."}
            />
          </div>
        </div>
      </div>
    </div>
  );
};