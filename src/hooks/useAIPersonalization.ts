import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AIInsight = {
  id: string;
  title?: string;
  text: string;
  emoji?: string;
  type: 'positive' | 'warning';
};

export type AIRecommendation = {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'general';
  emoji?: string;
};

export type AIPersonalization = {
  id: string;
  user_id: string;
  plans_generated: boolean;
  analysis_type: string;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  last_analysis_at: string;
  created_at: string;
};

export const useAIPersonalization = () => {
  const { user } = useAuth();
  const [personalization, setPersonalization] = useState<AIPersonalization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalization = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_personalizations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_analysis_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPersonalization({
          ...data,
          insights: (data.insights || []).map((insight: any, idx: number) => ({
            id: insight.id || `insight-${idx}`,
            title: insight.title,
            text: insight.text || insight.description || '',
            emoji: insight.emoji || '💡',
            type: insight.type === 'warning' ? 'warning' : 'positive',
          })),
          recommendations: (data.recommendations || []).map((rec: any, idx: number) => ({
            id: rec.id || `rec-${idx}`,
            title: rec.title || 'Recommendation',
            description: rec.description || '',
            category: rec.category || 'general',
            emoji: rec.emoji || '✨',
          })),
        } as AIPersonalization);
      } else {
        setPersonalization(null);
      }
      setError(null);
    } catch (e) {
      console.error('Failed to load AI personalization', e);
      setError(e instanceof Error ? e.message : 'Failed to load AI personalization');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  return {
    personalization,
    loading,
    error,
    refetch: fetchPersonalization,
  };
};


