import { TrendAnalysis } from '@/lib/trends/calculator';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'general';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  emoji: string;
}

export interface TrendRecommendationRequest {
  trends: TrendAnalysis;
  userGoals: string[];
  userProfile: {
    age?: number;
    fitnessLevel?: string;
    injuries?: string[];
    allergies?: string[];
  };
}

/**
 * Generate AI recommendations based on trend analysis
 */
import { config } from '@/lib/config';
import { supabase } from '@/integrations/supabase/client';

export async function generateTrendRecommendations(
  request: TrendRecommendationRequest
): Promise<AIRecommendation[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${config.api.baseUrl}/ai-trend-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'apikey': config.supabase.anonKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    // Return fallback recommendations
    return generateFallbackRecommendations(request);
  }
}

/**
 * Fallback recommendations when AI service is unavailable
 */
function generateFallbackRecommendations(request: TrendRecommendationRequest): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const { trends } = request;

  // Water trend recommendations
  if (trends.dailyCheckins.water?.trend === 'down') {
    recommendations.push({
      id: 'water-1',
      title: 'Hydration Focus',
      description: 'Your water intake has decreased. Try setting hourly reminders to drink water.',
      category: 'nutrition',
      priority: 'high',
      actionable: true,
      emoji: '💧'
    });
  }

  // Mood trend recommendations
  if (trends.dailyCheckins.mood?.trend === 'down') {
    recommendations.push({
      id: 'mood-1',
      title: 'Mood Support',
      description: 'Consider adding more outdoor activities or social connections to boost your mood.',
      category: 'mental',
      priority: 'high',
      actionable: true,
      emoji: '😊'
    });
  }

  // Sleep trend recommendations
  if (trends.dailyCheckins.sleep?.trend === 'down') {
    recommendations.push({
      id: 'sleep-1',
      title: 'Sleep Optimization',
      description: 'Your sleep hours have decreased. Try establishing a consistent bedtime routine.',
      category: 'general',
      priority: 'high',
      actionable: true,
      emoji: '😴'
    });
  }

  // Energy trend recommendations
  if (trends.dailyCheckins.energy?.trend === 'down') {
    recommendations.push({
      id: 'energy-1',
      title: 'Energy Boost',
      description: 'Your energy levels are declining. Consider adjusting your nutrition and exercise routine.',
      category: 'fitness',
      priority: 'medium',
      actionable: true,
      emoji: '⚡'
    });
  }

  // Consistency recommendations
  if (trends.overall.consistency?.trend === 'down') {
    recommendations.push({
      id: 'consistency-1',
      title: 'Build Consistency',
      description: 'Focus on small, daily habits to build momentum and consistency.',
      category: 'general',
      priority: 'medium',
      actionable: true,
      emoji: '🎯'
    });
  }

  return recommendations;
}

/**
 * Get personalized recommendations based on user's current state
 */
export function getPersonalizedRecommendations(
  trends: TrendAnalysis,
  userGoals: string[],
  hasActiveProgram: boolean
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Goal-based recommendations
  if (userGoals.includes('IMPROVE_SLEEP') && trends.dailyCheckins.sleep?.trend === 'down') {
    recommendations.push({
      id: 'sleep-goal-1',
      title: 'Sleep Goal Progress',
      description: 'Your sleep goal needs attention. Try reducing screen time before bed.',
      category: 'general',
      priority: 'high',
      actionable: true,
      emoji: '🌙'
    });
  }

  if (userGoals.includes('BUILD_MUSCLE') && trends.programEntries.fitness?.trend === 'down') {
    recommendations.push({
      id: 'muscle-goal-1',
      title: 'Muscle Building Focus',
      description: 'Increase your strength training frequency to meet your muscle building goals.',
      category: 'fitness',
      priority: 'high',
      actionable: true,
      emoji: '💪'
    });
  }

  if (userGoals.includes('IMPROVE_NUTRITION') && trends.programEntries.nutrition?.trend === 'down') {
    recommendations.push({
      id: 'nutrition-goal-1',
      title: 'Nutrition Tracking',
      description: 'Track your meals more consistently to improve your nutrition habits.',
      category: 'nutrition',
      priority: 'medium',
      actionable: true,
      emoji: '🥗'
    });
  }

  // Program engagement recommendations
  if (!hasActiveProgram) {
    recommendations.push({
      id: 'program-1',
      title: 'Start a Program',
      description: 'Consider starting a structured program to accelerate your progress.',
      category: 'general',
      priority: 'medium',
      actionable: true,
      emoji: '📋'
    });
  }

  return recommendations;
}
