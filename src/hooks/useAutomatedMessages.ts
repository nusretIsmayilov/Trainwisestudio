import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AutomatedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  category: 'motivational' | 'system';
  is_automated: boolean;
  program_id?: string;
  created_at: string;
}

export interface MessageTemplate {
  daily_checkin: string[];
  weekly_progress: string[];
  milestone_achieved: string[];
  program_start: string[];
  program_completion: string[];
  motivation_boost: string[];
}

export interface SystemTemplate {
  payment_reminder: string;
  feature_update: string;
  maintenance_notice: string;
  security_alert: string;
}

export const useAutomatedMessages = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<{
    motivational: MessageTemplate;
    system: SystemTemplate;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/automated-messages`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch message templates');

      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      console.error('Error fetching message templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const sendAutomatedMessage = async (
    userId: string,
    messageType: string,
    programId?: string,
    coachId?: string
  ) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/automated-messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          messageType,
          programId,
          coachId: coachId || user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send automated message');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error sending automated message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send automated message');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRandomMessage = (messageType: keyof MessageTemplate): string => {
    if (!templates?.motivational) return 'Keep up the great work!';
    
    const messages = templates.motivational[messageType];
    if (!messages || messages.length === 0) return 'Keep up the great work!';
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getSystemMessage = (messageType: keyof SystemTemplate): string => {
    if (!templates?.system) return 'System notification';
    
    return templates.system[messageType] || 'System notification';
  };

  return {
    templates,
    loading,
    error,
    sendAutomatedMessage,
    getRandomMessage,
    getSystemMessage,
    refetch: fetchTemplates
  };
};
