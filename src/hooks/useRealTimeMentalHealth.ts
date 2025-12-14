import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MentalHealthEntry {
  date: string;
  sleepHours: number;
  stressLevel: number;
  energyLevel: number;
  mood: string;
  meditationMinutes: number;
  journalingCompleted: boolean;
  source: 'daily_checkin' | 'mental_health_program';
  sourceId: string;
  sourceName: string;
}

export interface RealTimeMentalHealthData {
  entries: MentalHealthEntry[];
  todaySleep: number;
  todayStress: number;
  todayEnergy: number;
  todayMood: string;
  avgSleepLast7Days: number;
  avgStressLast7Days: number;
  avgEnergyLast7Days: number;
  meditationStreak: number;
  journalingStreak: number;
  yogaStreak: number;
  hasMinimumData: boolean;
  hasAnyData: boolean;
}

export const useRealTimeMentalHealth = () => {
  const { user } = useAuth();
  const [data, setData] = useState<RealTimeMentalHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeMentalHealth = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Fetch all mental health-related data
        const [dailyCheckins, mentalHealthPrograms] = await Promise.all([
          // Daily check-ins data
          supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true }),

          // Mental health program entries
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
            .eq('type', 'mental')
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true })
        ]);

        // Process daily check-ins
        const dailyCheckinEntries: MentalHealthEntry[] = dailyCheckins.data?.map(checkin => ({
          date: checkin.date,
          sleepHours: checkin.sleep_hours || 0,
          stressLevel: checkin.stress || 0,
          energyLevel: checkin.energy || 0,
          mood: checkin.mood || 'neutral',
          meditationMinutes: 0, // Not tracked in daily check-ins
          journalingCompleted: false, // Not tracked in daily check-ins
          source: 'daily_checkin' as const,
          sourceId: checkin.id,
          sourceName: 'Daily Check-in'
        })) || [];

        // Process mental health program entries
        const mentalHealthEntries: MentalHealthEntry[] = mentalHealthPrograms.data?.map(entry => {
          const programData = entry.data?.mental_health || {};
          return {
            date: entry.date,
            sleepHours: programData.sleep_hours || 0,
            stressLevel: programData.stress_level || 0,
            energyLevel: programData.energy_level || 0,
            mood: programData.mood || 'neutral',
            meditationMinutes: programData.meditation_minutes || 0,
            journalingCompleted: programData.journaling_completed || false,
            source: 'mental_health_program' as const,
            sourceId: (entry.program as any)?.id || '',
            sourceName: (entry.program as any)?.name || 'Mental Health Program'
          };
        }) || [];

        // Combine all entries and group by date
        const allEntries = [...dailyCheckinEntries, ...mentalHealthEntries];
        
        // Group by date and merge data (prioritize mental health program data over daily check-ins)
        const dailyTotals = allEntries.reduce((acc, entry) => {
          if (!acc[entry.date]) {
            acc[entry.date] = {
              date: entry.date,
              sleepHours: 0,
              stressLevel: 0,
              energyLevel: 0,
              mood: 'neutral',
              meditationMinutes: 0,
              journalingCompleted: false,
              sources: []
            };
          }
          
          // Use the most recent or most complete data for each metric
          if (entry.sleepHours > 0) acc[entry.date].sleepHours = entry.sleepHours;
          if (entry.stressLevel > 0) acc[entry.date].stressLevel = entry.stressLevel;
          if (entry.energyLevel > 0) acc[entry.date].energyLevel = entry.energyLevel;
          if (entry.mood !== 'neutral') acc[entry.date].mood = entry.mood;
          if (entry.meditationMinutes > 0) acc[entry.date].meditationMinutes = entry.meditationMinutes;
          if (entry.journalingCompleted) acc[entry.date].journalingCompleted = entry.journalingCompleted;
          
          acc[entry.date].sources.push(entry.sourceName);
          return acc;
        }, {} as Record<string, any>);

        const dailyEntries = Object.values(dailyTotals).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate today's data
        const todayEntry = dailyEntries.find(entry => entry.date === today);
        const todaySleep = todayEntry?.sleepHours || 0;
        const todayStress = todayEntry?.stressLevel || 0;
        const todayEnergy = todayEntry?.energyLevel || 0;
        const todayMood = todayEntry?.mood || 'neutral';

        // Calculate 7-day averages
        const last7Days = dailyEntries.slice(-7);
        const avgSleepLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.sleepHours, 0) / last7Days.length 
          : 0;
        const avgStressLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.stressLevel, 0) / last7Days.length 
          : 0;
        const avgEnergyLast7Days = last7Days.length > 0 
          ? last7Days.reduce((sum, entry) => sum + entry.energyLevel, 0) / last7Days.length 
          : 0;

        // Calculate streaks
        const meditationStreak = calculateStreak(dailyEntries, 'meditationMinutes');
        const journalingStreak = calculateStreak(dailyEntries, 'journalingCompleted');
        const yogaStreak = calculateYogaStreak(dailyEntries); // This would need to be calculated from fitness programs

        // Check data requirements
        const hasMinimumData = dailyEntries.length >= 7;
        const hasAnyData = dailyEntries.length > 0;

        setData({
          entries: allEntries,
          todaySleep,
          todayStress,
          todayEnergy,
          todayMood,
          avgSleepLast7Days,
          avgStressLast7Days,
          avgEnergyLast7Days,
          meditationStreak,
          journalingStreak,
          yogaStreak,
          hasMinimumData,
          hasAnyData
        });

      } catch (error) {
        console.error('Error fetching real-time mental health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeMentalHealth();
  }, [user]);

  return { data, loading };
};

// Helper function to calculate streaks
const calculateStreak = (entries: any[], field: string) => {
  let streak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (field === 'journalingCompleted') {
      if (entries[i][field]) {
        streak++;
      } else {
        break;
      }
    } else {
      if (entries[i][field] > 0) {
        streak++;
      } else {
        break;
      }
    }
  }
  return streak;
};

// Helper function to calculate yoga streak (would need to be implemented based on fitness programs)
const calculateYogaStreak = (entries: any[]) => {
  // This would need to be calculated from fitness program entries
  // For now, return a placeholder value
  return 5;
};
