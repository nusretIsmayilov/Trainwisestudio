import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MotivationMessage {
  id: string;
  message: string;
  category: 'general' | 'fitness' | 'nutrition' | 'mental_health';
  created_at: string;
}

interface StreakData {
  workoutStreak: number;
  checkinStreak: number;
  lastWorkoutDate: string | null;
  lastCheckinDate: string | null;
}

export const useStreaksAndMotivation = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    workoutStreak: 0,
    checkinStreak: 0,
    lastWorkoutDate: null,
    lastCheckinDate: null,
  });
  const [motivationMessage, setMotivationMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStreaksAndMotivation = async () => {
      try {
        setLoading(true);

        // Fetch workout streak from program_entries
        // We derive workouts from program_entries where type = 'fitness' and date is set
        const { data: workoutEntries, error: workoutError } = await supabase
          .from('program_entries')
          .select('date')
          .eq('user_id', user.id)
          .eq('type', 'fitness')
          .order('date', { ascending: false });

        if (workoutError) {
          console.error('Error fetching workout entries:', workoutError);
        }

        // Fetch checkin streak from daily_checkins
        const { data: checkinEntries, error: checkinError } = await supabase
          .from('daily_checkins')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (checkinError) {
          console.error('Error fetching checkin entries:', checkinError);
        }

        // Calculate workout streak
        let workoutStreak = 0;
        let lastWorkoutDate = null;
        
        if (workoutEntries && workoutEntries.length > 0) {
          lastWorkoutDate = workoutEntries[0].date as any;
          
          // Group by date and calculate consecutive days
          const workoutDates = new Set(
            workoutEntries.map(entry => 
              new Date((entry as any).date).toDateString()
            )
          );
          
          const sortedDates = Array.from(workoutDates)
            .map(date => new Date(date))
            .sort((a, b) => b.getTime() - a.getTime());
          
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Check if user worked out today or yesterday
          const hasRecentWorkout = sortedDates.some(date => {
            const dateStr = date.toDateString();
            return dateStr === today.toDateString() || dateStr === yesterday.toDateString();
          });
          
          if (hasRecentWorkout) {
            // Calculate consecutive days - always start from 1 if there's at least one workout
            let currentStreak = 1;
            let checkDate = new Date(today);
            
            for (const workoutDate of sortedDates) {
              const workoutDateStr = workoutDate.toDateString();
              const checkDateStr = checkDate.toDateString();
              
              if (workoutDateStr === checkDateStr) {
                if (currentStreak === 1) {
                  // First day counts as 1, subsequent days increment
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  currentStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                }
              } else {
                break;
              }
            }
            
            workoutStreak = currentStreak;
          }
        }

        // Calculate checkin streak
        let checkinStreak = 0;
        let lastCheckinDate = null;
        
        if (checkinEntries && checkinEntries.length > 0) {
          lastCheckinDate = checkinEntries[0].date;
          
          const checkinDates = new Set(
            checkinEntries.map(entry => entry.date)
          );
          
          const sortedCheckinDates = Array.from(checkinDates)
            .map(date => new Date(date))
            .sort((a, b) => b.getTime() - a.getTime());
          
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          // Check if user checked in today or yesterday
          const hasRecentCheckin = checkinDates.has(today) || checkinDates.has(yesterdayStr);
          
          if (hasRecentCheckin) {
            // Calculate consecutive days
            let currentStreak = 0;
            let checkDate = new Date(today);
            
            for (const checkinDate of sortedCheckinDates) {
              const checkinDateStr = checkinDate.toISOString().split('T')[0];
              const checkDateStr = checkDate.toISOString().split('T')[0];
              
              if (checkinDateStr === checkDateStr) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
            
            checkinStreak = currentStreak;
          }
        }

        setStreakData({
          workoutStreak,
          checkinStreak,
          lastWorkoutDate,
          lastCheckinDate,
        });

        // Fetch random motivation message
        const { data: motivationMessages, error: motivationError } = await supabase
          .from('motivation_messages')
          .select('message')
          .order('created_at', { ascending: false })
          .limit(50);

        if (motivationError) {
          console.error('Error fetching motivation messages:', motivationError);
          // Fallback to default messages
          const defaultMessages = [
            "The secret of getting ahead is getting started.",
            "Your only limit is your mind.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The only way to do great work is to love what you do.",
            "Don't watch the clock; do what it does. Keep going.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It's not whether you get knocked down, it's whether you get up.",
            "The way to get started is to quit talking and begin doing.",
            "Life is what happens to you while you're busy making other plans.",
            "The only impossible journey is the one you never begin."
          ];
          const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
          setMotivationMessage(randomMessage);
        } else if (motivationMessages && motivationMessages.length > 0) {
          const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)].message;
          setMotivationMessage(randomMessage);
        } else {
          // Fallback if no messages in database
          setMotivationMessage("The secret of getting ahead is getting started.");
        }

      } catch (error) {
        console.error('Error fetching streaks and motivation:', error);
        setMotivationMessage("The secret of getting ahead is getting started.");
      } finally {
        setLoading(false);
      }
    };

    fetchStreaksAndMotivation();
  }, [user]);

  return {
    streakData,
    motivationMessage,
    loading,
  };
};
