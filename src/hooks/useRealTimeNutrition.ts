import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NutritionEntry {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  source: 'recipe' | 'manual' | 'exercise';
  sourceId: string;
  sourceName: string;
}

export interface RealTimeNutritionData {
  entries: NutritionEntry[];
  totalCaloriesToday: number;
  totalProteinToday: number;
  totalCarbsToday: number;
  totalFatToday: number;
  avgCaloriesLast7Days: number;
  avgProteinLast7Days: number;
  avgCarbsLast7Days: number;
  avgFatLast7Days: number;
  currentWeight: number | null;
  weightChange: number;
}

export const useRealTimeNutrition = () => {
  const { user } = useAuth();
  const [data, setData] = useState<RealTimeNutritionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeNutrition = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Fetch all nutrition-related data
        const [recipeEntries, manualFoodEntries, exerciseEntries, weightEntries] = await Promise.all([
          // Recipe entries from completed nutrition programs
          supabase
            .from('program_entries')
            .select(`
              date,
              data,
              program:programs!inner(
                type,
                name
              )
            `)
            .eq('user_id', user.id)
            .eq('type', 'nutrition')
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true }),

          // Manual food entries
          supabase
            .from('manual_food_entries')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true }),

          // Exercise entries that affect nutrition (calories burned)
          supabase
            .from('program_entries')
            .select(`
              date,
              data,
              program:programs!inner(
                type,
                name
              )
            `)
            .eq('user_id', user.id)
            .eq('type', 'fitness')
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true }),

          // Weight entries for current weight
          supabase
            .from('weight_entries')
            .select('weight, date')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(1)
        ]);

        // Process recipe entries
        const recipeNutrition: NutritionEntry[] = recipeEntries.data?.map(entry => {
          const nutritionData = entry.data?.nutrition || {};
          return {
            date: entry.date,
            protein: nutritionData.protein || 0,
            carbs: nutritionData.carbs || 0,
            fat: nutritionData.fat || 0,
            calories: nutritionData.calories || 0,
            source: 'recipe' as const,
            sourceId: (entry.program as any)?.id || '',
            sourceName: (entry.program as any)?.name || 'Recipe'
          };
        }) || [];

        // Process manual food entries
        const manualNutrition: NutritionEntry[] = manualFoodEntries.data?.map(entry => ({
          date: entry.date,
          protein: entry.protein || 0,
          carbs: entry.carbs || 0,
          fat: entry.fat || 0,
          calories: entry.calories || 0,
          source: 'manual' as const,
          sourceId: entry.id,
          sourceName: entry.food_name || 'Manual Entry'
        })) || [];

        // Process exercise entries (calories burned)
        const exerciseNutrition: NutritionEntry[] = exerciseEntries.data?.map(entry => {
          const exerciseData = entry.data?.exercise || {};
          const caloriesBurned = exerciseData.calories_burned || 0;
          return {
            date: entry.date,
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: -caloriesBurned, // Negative because it's calories burned
            source: 'exercise' as const,
            sourceId: (entry.program as any)?.id || '',
            sourceName: (entry.program as any)?.name || 'Exercise'
          };
        }) || [];

        // Combine all nutrition entries
        const allEntries = [...recipeNutrition, ...manualNutrition, ...exerciseNutrition];
        
        // Group by date and calculate daily totals
        const dailyTotals = allEntries.reduce((acc, entry) => {
          if (!acc[entry.date]) {
            acc[entry.date] = {
              date: entry.date,
              protein: 0,
              carbs: 0,
              fat: 0,
              calories: 0,
              sources: []
            };
          }
          acc[entry.date].protein += entry.protein;
          acc[entry.date].carbs += entry.carbs;
          acc[entry.date].fat += entry.fat;
          acc[entry.date].calories += entry.calories;
          acc[entry.date].sources.push(entry.sourceName);
          return acc;
        }, {} as Record<string, any>);

        const dailyEntries = Object.values(dailyTotals).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate today's totals
        const todayEntry = dailyEntries.find(entry => entry.date === today);
        const totalCaloriesToday = todayEntry?.calories || 0;
        const totalProteinToday = todayEntry?.protein || 0;
        const totalCarbsToday = todayEntry?.carbs || 0;
        const totalFatToday = todayEntry?.fat || 0;

        // Calculate 7-day averages
        const last7Days = dailyEntries.slice(-7);
        const avgCaloriesLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.calories, 0) / last7Days.length 
          : 0;
        const avgProteinLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.protein, 0) / last7Days.length 
          : 0;
        const avgCarbsLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.carbs, 0) / last7Days.length 
          : 0;
        const avgFatLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.fat, 0) / last7Days.length 
          : 0;

        // Get current weight
        const currentWeight = weightEntries.data?.[0]?.weight || null;
        const weightChange = 0; // Could calculate from previous weight entries

        setData({
          entries: allEntries,
          totalCaloriesToday,
          totalProteinToday,
          totalCarbsToday,
          totalFatToday,
          avgCaloriesLast7Days,
          avgProteinLast7Days,
          avgCarbsLast7Days,
          avgFatLast7Days,
          currentWeight,
          weightChange
        });

      } catch (error) {
        console.error('Error fetching real-time nutrition data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeNutrition();
  }, [user]);

  return { data, loading };
};
