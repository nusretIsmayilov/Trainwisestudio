import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { postJson } from '@/lib/utils';

export interface PayoutRecord {
  id: string;
  coach_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_amount_cents: number;
  status: 'pending' | 'paid' | 'failed';
  period_start: string; // date
  period_end: string;   // date
  created_at: string;
}

export const useCoachPayouts = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayouts((data || []) as PayoutRecord[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(); }, [user]);

  const requestWithdrawal = async (amountCents: number) => {
    if (!user) throw new Error('Not authenticated');
    const { config } = await import('@/lib/config');
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'apikey': config.supabase.anonKey,
    };
    const response = await fetch(`${config.api.baseUrl}/coach-payouts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'request', amountCents, coachId: user.id }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed: ${response.status}`);
    }
    return await response.json();
  };

  return { payouts, loading, error, refetch: fetchPayouts, requestWithdrawal };
};


