import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageWithSender } from '@/hooks/useMessages';
import { useOfferActions } from '@/hooks/useOfferActions';
import { toast } from 'sonner';
import { DollarSign, Clock, Check, X } from 'lucide-react';
import { createOfferCheckoutSession } from '@/lib/stripe/api';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface OfferMessageProps {
  message: MessageWithSender;
  isOwn: boolean;
  userRole?: string;
}

export const OfferMessage: React.FC<OfferMessageProps> = ({
  message,
  isOwn,
  userRole
}) => {
  const { acceptOffer, rejectOffer, rejectOfferByMessage, loading } = useOfferActions();

  const offer = message.coach_offer;
  const hasExpiry = Boolean(offer?.expires_at);
  const isExpired = hasExpiry && offer && new Date(offer.expires_at) < new Date();

  const handleAcceptOffer = async () => {
    try {
      // Ensure we have an offer id (in case join didn't hydrate yet)
      let offerId = offer?.id as string | undefined;
      if (!offerId) {
        const { data } = await supabase
          .from('coach_offers')
          .select('id')
          .eq('message_id', message.id)
          .maybeSingle();
        offerId = data?.id;
      }
      if (!offerId) {
        toast.error('Offer not ready yet. Please try again in a moment.');
        return;
      }
      // Redirect to Stripe Checkout for one-time payment
      const appUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { checkoutUrl } = await createOfferCheckoutSession(offerId, appUrl);
      
      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error("Failed to accept offer. Please try again.");
    }
  };

  const handleRejectOffer = async () => {
    try {
      // Ensure we have an offer id (in case join didn't hydrate yet)
      let offerId = offer?.id as string | undefined;
      if (!offerId) {
        const { data } = await supabase
          .from('coach_offers')
          .select('id')
          .eq('message_id', message.id)
          .maybeSingle();
        offerId = data?.id;
      }
      // If offer row missing, delete by message id (removes message + any linked offer)
      if (!offerId) {
        await rejectOfferByMessage(message.id);
      } else {
        await rejectOffer(offerId);
      }
      toast.success("The offer has been declined.");
    } catch (error) {
      toast.error("Failed to reject offer. Please try again.");
    }
  };

  const getStatusBadge = () => {
    if (!offer) return null;

    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      accepted: { label: 'Accepted', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      expired: { label: 'Expired', variant: 'outline' as const }
    };

    const status = (isExpired ? 'expired' : (offer.status || 'pending')) as keyof typeof statusConfig;
    const config = statusConfig[status];
    if (!config) {
      return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  // Determine effective status and whether customer can respond
  const effectiveStatus: 'pending' | 'accepted' | 'rejected' | 'expired' = (isExpired
    ? 'expired'
    : ((offer?.status as any) || 'pending'));
  const canRespond = !isOwn
    && (userRole ? userRole === 'customer' : true)
    && effectiveStatus === 'pending'
    && !isExpired;

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] md:max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar_url} />
          <AvatarFallback>
            {message.sender.full_name?.split(' ').map(n => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.full_name}
          </span>
        )}
        
        <Card className={cn(
          "w-full max-w-full sm:max-w-sm",
          isOwn ? "bg-primary/5" : "bg-muted/50"
        )}>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="font-medium text-xs sm:text-sm">Coaching Offer</span>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground">{message.content}</p>
            
            {offer && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">${(offer.price ?? (message as any)?.metadata?.price) ?? ''}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{(offer.duration_months ?? (message as any)?.metadata?.duration_months) ?? ''} weeks</span>
                </div>
                
                {offer.status === 'pending' && !isExpired && hasExpiry && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Expires {formatDistanceToNow(new Date(offer.expires_at), { addSuffix: true })}
                  </div>
                )}
                
                {canRespond && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleAcceptOffer}
                      disabled={loading}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRejectOffer}
                      disabled={loading}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};