import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface ProgramEntry {
  id: string;
  user_id: string;
  program_id: string | null;
  date: string; // YYYY-MM-DD
  type: 'fitness' | 'nutrition' | 'mental';
  notes?: string | null;
  data?: any;
}

export const useProgramEntries = (programId?: string) => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const { upsert: queueUpsert, isOnline } = useTableMutations('program_entries');
  const [entries, setEntries] = useState<ProgramEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('program_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
      if (programId) query = query.eq('program_id', programId);
      const { data, error } = await query;
      if (error) throw error;
      setEntries((data || []) as ProgramEntry[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load program entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, [user, programId]);

  const completeToday = async (payload: { program_id: string | null; type: ProgramEntry['type']; notes?: string; data?: any; }) => {
    if (!user) throw new Error('Not authenticated');
    const today = new Date().toISOString().slice(0, 10);
    
    // Use mutation queue for offline support and scalability
    try {
      await queueUpsert(
        {
          user_id: user.id,
          program_id: payload.program_id,
          date: today,
          type: payload.type,
          notes: payload.notes || null,
          data: payload.data || null,
        },
        'user_id,program_id,date',
        {
          invalidateQueries: [
            queryKeys.programEntries(programId, user.id),
            queryKeys.programEntries(undefined, user.id),
          ],
        }
      );
      
      // If online, fetch immediately; otherwise queue will handle it
      if (isOnline) {
        await fetchEntries();
        await refreshAll();
      }
      
      // Return optimistic data
      return [{
        id: `temp_${Date.now()}`,
        user_id: user.id,
        program_id: payload.program_id,
        date: today,
        type: payload.type,
        notes: payload.notes || null,
        data: payload.data || null,
      }] as ProgramEntry[];
    } catch (error) {
      // Fallback to direct Supabase call if queue fails
      const { data, error: supabaseError } = await supabase
        .from('program_entries')
        .upsert({
          user_id: user.id,
          program_id: payload.program_id,
          date: today,
          type: payload.type,
          notes: payload.notes || null,
          data: payload.data || null,
        }, { onConflict: 'user_id,program_id,date' })
        .select('*');
      if (supabaseError) throw supabaseError;
      await fetchEntries();
      await refreshAll();
      return data as ProgramEntry[];
    }
  };

  return { entries, loading, error, refetch: fetchEntries, completeToday };
};


