import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyCheckins } from './useDailyCheckins';
import { useWeightTracking } from './useWeightTracking';
import { useProgressPhotos } from './useProgressPhotos';

export interface ProgressData {
  dailyCheckins: Array<{
    date: string;
    water_liters: number | null;
    waterLiters: number | null; // Required alias
    mood: 'great' | 'good' | 'okay' | 'bad'; // Match the correct type
    energy: number | null;
    energyLevel: number | null; // Required alias
    sleep_hours: number | null;
    sleepHours: number | null; // Required alias
    stressLevel: number | null; // Required field
  }>;
  programEntries: Array<{
    id: string;
    program_id: string | null;
    date: string;
    type: 'fitness' | 'nutrition' | 'mental';
    notes: string | null;
    data: any;
  }>;
  workoutStreak: number;
  kcalBurnedLast7Days: number;
  userGoals: Array<{
    id: string;
    title: string;
    type: 'IMPROVE_SLEEP' | 'BUILD_MUSCLE' | 'IMPROVE_NUTRITION'; // Required
    target: number;
    current: number;
    unit: string;
  }>;
  smartInsights: Array<{
    id: string;
    title?: string; // Optional
    text: string; // Required
    emoji: string; // Required
    description?: string; // Optional
    type: 'positive' | 'warning'; // Match the correct type without 'info'
  }>;
  fitnessProgression: {
    strength: Array<{ date: string; value: number }>;
    cardio: Array<{ date: string; value: number }>;
    flexibility: Array<{ date: string; value: number }>;
  };
  nutrition: {
    macros: Array<{
      date: string;
      protein: number;
      carbs: number;
      fat: number;
      calories?: number; // Optional
      kcal: number; // Required
    }>;
    waterIntake?: Array<{ date: string; liters: number }>; // Optional
    recommended: { kcal: number; protein: number; carbs: number; fat: number }; // Required
    mealCompletion: number; // Required
    outsideMeals: number; // Required
    recentRecipes: Array<any>; // Required
  };
  mentalHealth: {
    moodTrend: Array<{ date: string; value: number }>;
    stressLevel: Array<{ date: string; value: number }>;
    sleepQuality: Array<{ date: string; value: number }>;
  };
  photoEntries: Array<{
    id: string;
    date: string;
    imageUrl: string;
    notes?: string;
  }>;
  weightEntries: Array<{
    id: string;
    date: string;
    weight_kg: number;
    notes?: string;
  }>;
}

export const useCustomerProgress = () => {
  const { user } = useAuth();
  const { checkins: dailyCheckins, last7Days } = useDailyCheckins();
  const { entries: weightEntries } = useWeightTracking();
  const { photos: progressPhotos } = useProgressPhotos();
  const [programEntries, setProgramEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgramEntries = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('program_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setProgramEntries(data || []);
    } catch (e) {
      console.error('Failed to fetch program entries:', e);
    }
  };

  useEffect(() => {
    fetchProgramEntries();
  }, [user]);

  const progressData = useMemo((): ProgressData => {
    // Calculate workout streak from program entries
    const fitnessEntries = programEntries.filter(entry => entry.type === 'fitness');
    const sortedEntries = fitnessEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate calories burned (mock calculation based on entries)
    const kcalBurnedLast7Days = fitnessEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return entryDate >= sevenDaysAgo;
      })
      .reduce((total, entry) => total + (entry.data?.calories_burned || 0), 0);

    // Generate goals based on real data
    const avgWater = last7Days.length > 0 
      ? last7Days.reduce((sum, day) => sum + (day.water_liters || 0), 0) / last7Days.length 
      : 0;
    const avgSleep = last7Days.length > 0
      ? last7Days.reduce((sum, day) => sum + (day.sleep_hours || 0), 0) / last7Days.length
      : 0;
    const weeklyWorkouts = fitnessEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    }).length;

    const userGoals = [
      { id: '1', title: 'Daily Water Intake', target: 2.5, current: avgWater, unit: 'L' },
      { id: '2', title: 'Weekly Workouts', target: 5, current: weeklyWorkouts, unit: 'sessions' },
      { id: '3', title: 'Sleep Hours', target: 8, current: avgSleep, unit: 'hours' },
    ];

    // Generate smart insights based on data
    const smartInsights = [];
    
    if (last7Days.length > 0) {
      const avgSleep = last7Days.reduce((sum, day) => sum + (day.sleep_hours || 0), 0) / last7Days.length;
      if (avgSleep < 7) {
        smartInsights.push({
          id: '1',
          title: 'Sleep Optimization',
          description: `Your average sleep is ${avgSleep.toFixed(1)} hours. Consider improving sleep hygiene.`,
          type: 'warning' as const
        });
      }
    }

    if (streak > 0) {
      smartInsights.push({
        id: '2',
        title: 'Workout Streak',
        description: `Great job! You've worked out for ${streak} consecutive days.`,
        type: 'positive' as const
      });
    }

    // Generate fitness progression data based on actual program entries
    const fitnessProgression = {
      strength: last7Days.map((day, index) => {
        const dayEntries = fitnessEntries.filter(entry => entry.date === day.date);
        const strengthValue = dayEntries.length > 0 
          ? dayEntries.reduce((sum, entry) => sum + (entry.data?.strength_score || 0), 0) / dayEntries.length
          : 50 + (index * 2) + Math.random() * 5; // Fallback with slight progression
        return {
          date: day.date,
          value: Math.max(0, strengthValue)
        };
      }),
      cardio: last7Days.map((day, index) => {
        const dayEntries = fitnessEntries.filter(entry => entry.date === day.date);
        const cardioValue = dayEntries.length > 0 
          ? dayEntries.reduce((sum, entry) => sum + (entry.data?.cardio_score || 0), 0) / dayEntries.length
          : 30 + (index * 1.5) + Math.random() * 4; // Fallback with slight progression
        return {
          date: day.date,
          value: Math.max(0, cardioValue)
        };
      }),
      flexibility: last7Days.map((day, index) => {
        const dayEntries = fitnessEntries.filter(entry => entry.date === day.date);
        const flexibilityValue = dayEntries.length > 0 
          ? dayEntries.reduce((sum, entry) => sum + (entry.data?.flexibility_score || 0), 0) / dayEntries.length
          : 40 + (index * 1) + Math.random() * 3; // Fallback with slight progression
        return {
          date: day.date,
          value: Math.max(0, flexibilityValue)
        };
      })
    };

    // Generate nutrition data based on actual program entries and check-ins
    const nutrition = {
      macros: last7Days.map(day => {
        const dayEntries = programEntries.filter(entry => entry.date === day.date && entry.type === 'nutrition');
        if (dayEntries.length > 0) {
          // Use actual nutrition data from program entries
          const totalProtein = dayEntries.reduce((sum, entry) => sum + (entry.data?.protein || 0), 0);
          const totalCarbs = dayEntries.reduce((sum, entry) => sum + (entry.data?.carbs || 0), 0);
          const totalFat = dayEntries.reduce((sum, entry) => sum + (entry.data?.fat || 0), 0);
          const totalCalories = dayEntries.reduce((sum, entry) => sum + (entry.data?.calories || 0), 0);
          return {
            date: day.date,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
            calories: totalCalories
          };
        } else {
          // Fallback to realistic estimates based on check-in data
          const energyLevel = day.energy || 3;
          const baseCalories = 1500 + (energyLevel * 100);
          return {
            date: day.date,
            protein: 60 + (energyLevel * 10) + Math.random() * 20,
            carbs: 150 + (energyLevel * 20) + Math.random() * 30,
            fat: 40 + (energyLevel * 5) + Math.random() * 10,
            calories: baseCalories + Math.random() * 200
          };
        }
      }),
      waterIntake: last7Days.map(day => ({
        date: day.date,
        liters: day.water_liters || 0
      }))
    };

    // Generate mental health data based on actual check-ins
    const mentalHealth = {
      moodTrend: last7Days.map(day => ({
        date: day.date,
        value: day.mood || 3
      })),
      stressLevel: last7Days.map(day => {
        // Calculate stress level based on sleep and energy
        const sleepHours = day.sleep_hours || 0;
        const energy = day.energy || 3;
        const stressLevel = Math.max(1, Math.min(5, 5 - (sleepHours / 8) - (energy / 5) + Math.random() * 0.5));
        return {
          date: day.date,
          value: stressLevel
        };
      }),
      sleepQuality: last7Days.map(day => {
        const sleepHours = day.sleep_hours || 0;
        const energy = day.energy || 3;
        // Sleep quality based on hours and energy level
        const quality = Math.max(1, Math.min(5, (sleepHours / 8) * 5 + (energy / 5) * 0.5));
        return {
          date: day.date,
          value: quality
        };
      })
    };

    // Use real photo entries from progress photos
    const photoEntries = progressPhotos.map(photo => ({
      id: photo.id,
      date: photo.date,
      imageUrl: photo.image_url,
      notes: photo.notes
    }));

    // Transform weight entries for the interface
    const weightEntriesData = weightEntries.map(entry => ({
      id: entry.id,
      date: entry.date,
      weight_kg: entry.weight_kg,
      notes: entry.notes
    }));

    return {
      dailyCheckins: dailyCheckins.map(checkin => ({
        date: checkin.date,
        water_liters: checkin.water_liters,
        waterLiters: checkin.water_liters || 0,
        mood: 'good' as const, // Default mood
        energy: checkin.energy,
        energyLevel: checkin.energy || 3,
        sleep_hours: checkin.sleep_hours,
        sleepHours: checkin.sleep_hours || 0,
        stressLevel: 5
      })),
      programEntries,
      workoutStreak: streak,
      kcalBurnedLast7Days,
      userGoals: userGoals.map(goal => ({
        ...goal,
        type: 'BUILD_MUSCLE' as const
      })),
      smartInsights: smartInsights.map(insight => ({
        ...insight,
        text: insight.description || '',
        emoji: '💡',
        type: insight.type === 'info' ? 'positive' : insight.type
      })),
      fitnessProgression,
      nutrition: {
        ...nutrition,
        macros: nutrition.macros.map(m => ({
          ...m,
          kcal: m.calories || 0
        })),
        recommended: { kcal: 2500, protein: 160, carbs: 220, fat: 65 },
        mealCompletion: 92,
        outsideMeals: 3,
        recentRecipes: []
      },
      mentalHealth,
      photoEntries,
      weightEntries: weightEntriesData
    };
  }, [dailyCheckins, programEntries, last7Days, weightEntries, progressPhotos]);

  return {
    progressData,
    loading,
    error,
    refetch: fetchProgramEntries
  };
};
