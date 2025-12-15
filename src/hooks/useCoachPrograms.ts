import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { Program, ProgramStatus, ProgramCategory } from '@/types/program';

export const useCoachPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { refreshAll } = useRefresh();

  const fetchPrograms = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select(`
          id,
          name,
          description,
          status,
          category,
          coach_id,
          assigned_to,
          scheduled_date,
          plan,
          is_ai_generated,
          created_at,
          updated_at
        `)
        .eq('coach_id', profile.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Program interface
      const transformedPrograms: Program[] = (data || []).map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        status: program.status as ProgramStatus,
        category: program.category as ProgramCategory,
        createdAt: program.created_at,
        updatedAt: program.updated_at,
        assignedTo: program.assigned_to,
        scheduledDate: program.scheduled_date || undefined,
        plan: program.plan || undefined,
        isAIGenerated: Boolean(program.is_ai_generated),
      }));

      setPrograms(transformedPrograms);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [profile?.id]);

  // Set up real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('programs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'programs',
          filter: `coach_id=eq.${profile.id}`,
        },
        () => {
          fetchPrograms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    programs,
    loading,
    error,
    refetch: fetchPrograms,
  };
};