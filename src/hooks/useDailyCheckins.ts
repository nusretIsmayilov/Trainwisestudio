import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface DailyCheckinRecord {
  id: string;
  user_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  water_liters: number | null;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
}

export const useDailyCheckins = () => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const { upsert: queueUpsert, isOnline } = useTableMutations('daily_checkins');
  const [checkins, setCheckins] = useState<DailyCheckinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckins = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      if (error) throw error;
      setCheckins((data || []) as DailyCheckinRecord[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, [user]);

  const upsertToday = async (payload: {
    water_liters?: number | null;
    mood?: number | null;
    energy?: number | null;
    sleep_hours?: number | null;
  }) => {
    if (!user) throw new Error('Not authenticated');
    const today = new Date().toISOString().slice(0, 10);
    
    // Use mutation queue for offline support and scalability
    try {
      await queueUpsert(
        {
          user_id: user.id,
          date: today,
          ...payload,
        },
        'user_id,date',
        {
          invalidateQueries: [
            queryKeys.dailyCheckins(user.id, today),
            queryKeys.dailyCheckins(user.id),
          ],
        }
      );
      
      // If online, fetch immediately; otherwise queue will handle it
      if (isOnline) {
        await fetchCheckins();
        await refreshAll();
      }
      
      // Return optimistic data
      return [{
        id: `temp_${Date.now()}`,
        user_id: user.id,
        date: today,
        water_liters: payload.water_liters ?? null,
        mood: payload.mood ?? null,
        energy: payload.energy ?? null,
        sleep_hours: payload.sleep_hours ?? null,
      }] as DailyCheckinRecord[];
    } catch (error) {
      // Fallback to direct Supabase call if queue fails
      const { data, error: supabaseError } = await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          date: today,
          ...payload,
        }, { onConflict: 'user_id,date' })
        .select('*');
      if (supabaseError) throw supabaseError;
      await fetchCheckins();
      await refreshAll();
      return data as DailyCheckinRecord[];
    }
  };

  const last7Days = useMemo(() => checkins.slice(-7), [checkins]);

  return { checkins, last7Days, loading, error, refetch: fetchCheckins, upsertToday };
};


