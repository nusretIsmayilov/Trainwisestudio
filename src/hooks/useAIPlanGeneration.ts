import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateAIMultiPlans, generateWeeklyAIFeedback } from '@/lib/ai/plan';

export const useAIPlanGeneration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThreePlans = async () => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const { items } = await generateAIMultiPlans({ userId: user.id });
      return items;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plans';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createWeeklyFeedback = async (weekOf: string) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const { status } = await generateWeeklyAIFeedback({ userId: user.id, weekOf });
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate weekly feedback';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateThreePlans, createWeeklyFeedback, loading, error };
};
