import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';

export interface CustomerProgram {
  id: string;
  name: string;
  title: string; // Required - will be set to name
  description: string;
  status: 'active' | 'scheduled' | 'purchased'; // Match Program status type
  category: 'fitness' | 'nutrition' | 'mental health';
  type: 'fitness' | 'nutrition' | 'mental'; // Required - mapped to match ProgramTaskType
  coach_id: string;
  assigned_to: string | null;
  scheduled_date: string | null;
  startDate: string | null; // Required - will be set to scheduled_date
  plan: any;
  created_at: string;
  updated_at: string;
  coach_name?: string;
  imageUrl: string; // Required - will have default
  weeks: any[]; // Required - will be empty array or program weeks
  isAIGenerated?: boolean;
}

export const useCustomerPrograms = () => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const [programs, setPrograms] = useState<CustomerProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          coach:coach_id(full_name)
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const programsWithCoach = (data || []).map(program => {
        // Map status to match Program type
        let mappedStatus: 'active' | 'scheduled' | 'purchased' = 'purchased';
        if (program.status === 'active') mappedStatus = 'active';
        else if (program.status === 'scheduled') mappedStatus = 'scheduled';
        
        return {
          ...program,
          coach_name: program.coach?.full_name || 'Unknown Coach',
          title: program.name, // Add title alias
          status: mappedStatus, // Map status
          type: program.category === 'mental health' ? 'mental' : program.category as 'fitness' | 'nutrition' | 'mental', // Map type properly
          startDate: program.scheduled_date, // Add startDate alias
          imageUrl: program.plan?.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200', // Add default image
          weeks: program.plan?.weeks || [], // Add default empty weeks array
          isAIGenerated: Boolean(program.is_ai_generated),
        };
      });
      
      setPrograms(programsWithCoach);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [user]);

  const activeProgram = programs.find(p => p.status === 'active');
  const scheduledPrograms = programs.filter(p => p.status === 'scheduled');

  return {
    programs,
    activeProgram,
    scheduledPrograms,
    loading,
    error,
    refetch: fetchPrograms
  };
};
