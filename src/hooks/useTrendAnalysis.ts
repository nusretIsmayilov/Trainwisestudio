import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyCheckins } from './useDailyCheckins';
import { useProgramEntries } from './useProgramEntries';
import { generateTrendAnalysis, TrendAnalysis } from '@/lib/trends/calculator';
import { generateTrendRecommendations, AIRecommendation } from '@/lib/ai/recommendations';

export const useTrendAnalysis = () => {
  const { user, profile } = useAuth();
  const { checkins } = useDailyCheckins();
  const { entries } = useProgramEntries();
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeTrends = async () => {
      if (!user || !checkins || !entries) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate trends
        const trendAnalysis = generateTrendAnalysis(checkins, entries);
        setTrends(trendAnalysis);

        // Get user goals from profile or onboarding details
        const onboardingDetails = ((profile as any)?.onboarding_details as any) || {};
        const userGoals = onboardingDetails.goals || [];
        const userProfile = {
          age: onboardingDetails.age,
          fitnessLevel: onboardingDetails.fitness_level,
          injuries: onboardingDetails.injuries || [],
          allergies: onboardingDetails.allergies || []
        };

        // Generate AI recommendations
        const aiRecommendations = await generateTrendRecommendations({
          trends: trendAnalysis,
          userGoals,
          userProfile
        });

        setRecommendations(aiRecommendations);
      } catch (err) {
        console.error('Error analyzing trends:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze trends');
      } finally {
        setLoading(false);
      }
    };

    analyzeTrends();
  }, [user, checkins, entries, profile]);

  return {
    trends,
    recommendations,
    loading,
    error,
    refetch: () => {
      // Trigger re-analysis
      setTrends(null);
      setRecommendations([]);
    }
  };
};
