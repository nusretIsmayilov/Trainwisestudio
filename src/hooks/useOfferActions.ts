import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOfferActions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const acceptOffer = async (offerId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Get offer details
      const { data: offer, error: offerError } = await supabase
        .from('coach_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;

      // Update offer status to accepted
      const { error: updateError } = await supabase
        .from('coach_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (updateError) throw updateError;

      // Update customer's coach_id and plan in profiles (commission logic applied by backend via webhooks)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          coach_id: offer.coach_id,
          plan: `${offer.duration_months}-week plan`,
          plan_expiry: new Date(Date.now() + offer.duration_months * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', offer.customer_id);

      if (profileError) throw profileError;

      // Send system message about acceptance
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('coach_id', offer.coach_id)
        .eq('customer_id', offer.customer_id)
        .single();

      if (conversation) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: `✅ Offer accepted! ${offer.duration_months}-week coaching plan for $${offer.price} is now active. Welcome to your personalized coaching journey!`,
            message_type: 'system'
          });
      }

      return true;
    } catch (err) {
      console.error('Error accepting offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async (offerId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Load the offer to get conversation details and send system message
      const { data: offerRow, error: fetchError } = await supabase
        .from('coach_offers')
        .select('id, message_id, coach_id, customer_id, price, duration_months')
        .eq('id', offerId)
        .single();

      if (fetchError) throw fetchError;

      // Send system message about rejection before deleting
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('coach_id', offerRow.coach_id)
        .eq('customer_id', offerRow.customer_id)
        .single();

      if (conversation) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: `❌ The offer has been declined.`,
            message_type: 'system'
          });
      }

      // Remove the original offer message from chat first (so UI updates via realtime DELETE)
      if (offerRow?.message_id) {
        await supabase
          .from('messages')
          .delete()
          .eq('id', offerRow.message_id);
      }

      // Delete the offer row entirely so it no longer appears as pending anywhere
      const { error: deleteOfferError } = await supabase
        .from('coach_offers')
        .delete()
        .eq('id', offerId);

      if (deleteOfferError) throw deleteOfferError;

      return true;
    } catch (err) {
      console.error('Error rejecting offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Robust decline by message id: removes the chat message and any linked offer
  const rejectOfferByMessage = async (messageId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Delete the message first so UI realtime removes it immediately
      const { error: deleteMsgError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (deleteMsgError) throw deleteMsgError;

      // Delete any coach_offers row linked to this message (if exists)
      const { error: deleteOfferError } = await supabase
        .from('coach_offers')
        .delete()
        .eq('message_id', messageId);

      if (deleteOfferError) throw deleteOfferError;

      return true;
    } catch (err) {
      console.error('Error rejecting offer by message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptOffer,
    rejectOffer,
    rejectOfferByMessage,
    loading
  };
};