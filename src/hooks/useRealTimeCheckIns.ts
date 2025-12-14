import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckInPin {
  id: string;
  type: 'checkin' | 'program';
  title: string;
  content: string;
  coach_id: string;
  user_id: string;
  program_id?: string;
  is_responded: boolean;
  response?: string;
  created_at: string;
  due_date?: string;
}

export interface CheckInHistory {
  id: string;
  type: 'checkin' | 'program';
  title: string;
  content: string;
  response: string;
  created_at: string;
  responded_at: string;
}

export const useRealTimeCheckIns = () => {
  const { user } = useAuth();
  const [activePins, setActivePins] = useState<CheckInPin[]>([]);
  const [history, setHistory] = useState<CheckInHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch active check-in pins (not responded to)
        const { data: pinsData, error: pinsError } = await supabase
          .from('coach_checkins')
          .select('*')
          .eq('customer_id', user.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (pinsError) {
          console.error('Error fetching check-in pins:', pinsError);
        } else {
          setActivePins(pinsData || []);
        }

        // Fetch check-in history (responded to)
        const { data: historyData, error: historyError } = await supabase
          .from('coach_checkins')
          .select('*')
          .eq('customer_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20);

        if (historyError) {
          console.error('Error fetching check-in history:', historyError);
        } else {
          setHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, [user]);

  const respondToCheckIn = async (pinId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('coach_checkins')
        .update({
          status: 'completed'
        })
        .eq('id', pinId);

      if (error) throw error;

      // Update local state
      setActivePins(prev => prev.filter(pin => pin.id !== pinId));
      setHistory(prev => [{
        id: pinId,
        type: 'checkin',
        title: 'Check-in Response',
        content: 'Coach check-in',
        response: response,
        created_at: new Date().toISOString(),
        responded_at: new Date().toISOString()
      }, ...prev]);
    } catch (error) {
      console.error('Error responding to check-in:', error);
      throw error;
    }
  };

  return { activePins, history, loading, respondToCheckIn };
};
