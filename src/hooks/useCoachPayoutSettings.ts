import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PayoutSettings {
  id?: string;
  coach_id: string;
  payout_method: 'paypal' | 'stripe';
  bank_details?: {
    account_holder: string;
    account_number: string;
    routing_number: string;
    bank_name: string;
    bank_number?: string;
    account_type?: 'checking' | 'savings';
    expire_date?: string;
    swift_code?: string;
    iban?: string;
  };
  paypal_email?: string;
  paypal_account_id?: string;
  stripe_account_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CoachBalance {
  totalEarnings: number;
  pendingAmount: number;
  availableBalance: number;
  availableBalanceFormatted: string;
}

export const useCoachPayoutSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [balance, setBalance] = useState<CoachBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchBalance();
    }
  }, [user]);

  const getAuthHeaders = async () => {
    const { config } = await import('@/lib/config');
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'apikey': config.supabase.anonKey,
    };
  };

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/coach-payouts?action=settings&coachId=${user.id}`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch payout settings');

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching payout settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payout settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/coach-payouts?action=balance&coachId=${user.id}`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch balance');

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<PayoutSettings>) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/coach-payouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update-settings',
          coachId: user.id,
          ...newSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payout settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      return true;
    } catch (err) {
      console.error('Error updating payout settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payout settings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async (amountCents: number) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/coach-payouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'request-payout',
          coachId: user.id,
          amountCents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request payout');
      }

      // Refresh balance after successful payout request
      await fetchBalance();
      return true;
    } catch (err) {
      console.error('Error requesting payout:', err);
      setError(err instanceof Error ? err.message : 'Failed to request payout');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    balance,
    loading,
    error,
    updateSettings,
    requestPayout,
    refetch: () => {
      fetchSettings();
      fetchBalance();
    }
  };
};
