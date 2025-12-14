import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface WeightEntry {
  id: string;
  weight_kg: number;
  date: string;
  notes?: string;
  created_at: string;
}

export const useWeightTracking = () => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const { insert: queueInsert, update: queueUpdate, upsert: queueUpsert, isOnline } = useTableMutations('weight_entries');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weight entries');
    } finally {
      setLoading(false);
    }
  };

  const addWeightEntry = async (weight: number, notes?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Use mutation queue for offline support and scalability
      try {
        await queueUpsert(
          {
            user_id: user.id,
            weight_kg: weight,
            date: today,
            notes: notes || null,
          },
          'user_id,date',
          {
            invalidateQueries: [queryKeys.profile(user.id)],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: `temp_${Date.now()}`,
          user_id: user.id,
          weight_kg: weight,
          date: today,
          notes: notes || null,
          created_at: new Date().toISOString(),
        } as WeightEntry;
        
        // Update local state optimistically
        setEntries(prev => {
          const filtered = prev.filter(e => e.date !== today);
          return [optimisticData, ...filtered];
        });
        
        // If online, refresh; otherwise queue will handle it
        if (isOnline) {
          await refreshAll();
        }
        
        return optimisticData;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct operation:', queueError);
        
        // First, check if there's already an entry for today
        const { data: existingEntry } = await supabase
          .from('weight_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        let data;
        if (existingEntry) {
          // Update existing entry
          const { data: updatedData, error } = await supabase
            .from('weight_entries')
            .update({
              weight_kg: weight,
              notes
            })
            .eq('id', existingEntry.id)
            .select()
            .single();
          
          if (error) throw error;
          data = updatedData;
        } else {
          // Create new entry
          const { data: newData, error } = await supabase
            .from('weight_entries')
            .insert({
              user_id: user.id,
              weight_kg: weight,
              date: today,
              notes
            })
            .select()
            .single();
          
          if (error) throw error;
          data = newData;
        }

        // Update local state
        setEntries(prev => {
          const filtered = prev.filter(e => e.date !== today);
          return [data, ...filtered];
        });
        
        await refreshAll();
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add weight entry');
      throw err;
    }
  };

  const getLatestWeight = () => {
    return entries.length > 0 ? entries[0].weight_kg : null;
  };

  const getWeightTrend = () => {
    console.log('getWeightTrend called with entries:', entries.length, entries);
    if (entries.length < 2) {
      console.log('Not enough entries for trend calculation');
      return 0;
    }
    
    const latest = entries[0].weight_kg;
    const previous = entries[1].weight_kg;
    const trend = latest - previous;
    console.log('Weight trend calculated:', { latest, previous, trend });
    return trend;
  };

  const getWeightHistory = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return {
    entries,
    loading,
    error,
    addWeightEntry,
    getLatestWeight,
    getWeightTrend,
    getWeightHistory,
    refetch: fetchEntries
  };
};
