import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientStatus {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  avatar_url: string;
  coach_id: string | null;
  status: 'waiting_offer' | 'has_offer' | 'active' | 'inactive';
  has_pending_offer: boolean;
  latest_offer_id?: string;
  latest_offer_price?: number;
  latest_offer_duration?: number;
  latest_offer_status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export const useClientStatus = (clientId?: string) => {
  const { user } = useAuth();
  const [clientStatus, setClientStatus] = useState<ClientStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientStatus = async (id?: string) => {
    if (!user || !id) return;

    try {
      setLoading(true);
      
      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, plan, avatar_url, coach_id')
        .eq('id', id)
        .eq('role', 'customer')
        .single();

      if (profileError) throw profileError;

      // Get latest offer for this client
      const { data: latestOffer, error: offerError } = await supabase
        .from('coach_offers')
        .select('id, price, duration_months, status, created_at')
        .eq('customer_id', id)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (offerError) throw offerError;

      // Determine client status
      let status: ClientStatus['status'] = 'inactive';
      let hasPendingOffer = false;

      if (profile.coach_id === user.id) {
        status = 'active';
      } else if (latestOffer) {
        if (latestOffer.status === 'pending') {
          status = 'has_offer';
          hasPendingOffer = true;
        } else if (latestOffer.status === 'rejected') {
          status = 'waiting_offer';
        } else {
          status = 'waiting_offer';
        }
      } else {
        status = 'waiting_offer';
      }

      setClientStatus({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        plan: profile.plan,
        avatar_url: profile.avatar_url,
        coach_id: profile.coach_id,
        status,
        has_pending_offer: hasPendingOffer,
        latest_offer_id: latestOffer?.id,
        latest_offer_price: latestOffer?.price,
        latest_offer_duration: latestOffer?.duration_months,
        latest_offer_status: latestOffer?.status
      });

    } catch (error) {
      console.error('Error fetching client status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientStatus(clientId);
    }
  }, [clientId, user]);

  return {
    clientStatus,
    loading,
    refreshStatus: () => fetchClientStatus(clientId)
  };
};
