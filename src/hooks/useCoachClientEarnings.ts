import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientEarningRow {
  customer_id: string;
  customer_name: string | null;
  total_earned_cents: number;
  active_contracts: number;
  last_payout_at: string | null;
}

export const useCoachClientEarnings = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<ClientEarningRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Sum offers per customer for this coach. Only count completed/paid offers
        const { data, error } = await supabase
          .from('coach_offers')
          .select('customer_id, price, status, created_at, profiles!coach_offers_customer_id_fkey(full_name)')
          .eq('coach_id', user.id)
          .eq('status', 'completed'); // Only count completed offers
        if (error) throw error;

        const map = new Map<string, ClientEarningRow>();
        (data || []).forEach((o: any) => {
          const key = o.customer_id;
          const prev = map.get(key) || {
            customer_id: key,
            customer_name: o.profiles?.full_name || null,
            total_earned_cents: 0,
            active_contracts: 0,
            last_payout_at: null as string | null,
          };
          const amountCents = Math.round(Number(o.price || 0) * 100);
          prev.total_earned_cents += amountCents;
          // Only count completed offers as active contracts
          if (o.status === 'completed') {
            prev.active_contracts += 1;
          }
          // Use created_at as placeholder for last payout/earning time
          if (!prev.last_payout_at || new Date(o.created_at) > new Date(prev.last_payout_at)) {
            prev.last_payout_at = o.created_at;
          }
          map.set(key, prev);
        });

        setRows(Array.from(map.values()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to compute earnings');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const totals = useMemo(() => {
    const totalNet = rows.reduce((acc, r) => acc + r.total_earned_cents, 0) / 100;
    return { totalNet };
  }, [rows]);

  return { rows, totals, loading, error };
};


