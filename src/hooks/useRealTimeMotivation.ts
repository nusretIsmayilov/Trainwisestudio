import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MotivationMessage {
  id: string;
  title: string;
  content: string;
  emoji: string;
  type: 'positive' | 'warning';
  created_at: string;
}

// Map category to emoji
const getEmojiForCategory = (category: string): string => {
  switch (category) {
    case 'fitness':
      return '💪';
    case 'nutrition':
      return '🥗';
    case 'mental_health':
      return '🧘';
    default:
      return '✨';
  }
};

export const useRealTimeMotivation = () => {
  const { user } = useAuth();
  const [motivationMessage, setMotivationMessage] = useState<MotivationMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMotivationMessage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get motivation messages from the database (same query as customer dashboard)
        const { data, error } = await supabase
          .from('motivation_messages')
          .select('id, message, category, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching motivation message:', error);
          // Fallback to default message
          setMotivationMessage({
            id: 'default',
            title: 'Daily Motivation',
            content: 'Every step you take towards your goals is progress. Keep pushing forward!',
            emoji: '💪',
            type: 'positive',
            created_at: new Date().toISOString()
          });
        } else if (data && data.length > 0) {
          // Select a random message from the results
          const randomIndex = Math.floor(Math.random() * data.length);
          const selected = data[randomIndex];
          
          // Map database fields to MotivationMessage interface
          setMotivationMessage({
            id: selected.id,
            title: 'Daily Motivation',
            content: selected.message, // Map 'message' field to 'content'
            emoji: getEmojiForCategory(selected.category || 'general'),
            type: 'positive',
            created_at: selected.created_at
          });
        } else {
          // Fallback if no messages in database
          const defaultMessages = [
            "The secret of getting ahead is getting started.",
            "Your only limit is your mind.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The only way to do great work is to love what you do.",
            "Don't watch the clock; do what it does. Keep going.",
          ];
          const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
          setMotivationMessage({
            id: 'default',
            title: 'Daily Motivation',
            content: randomMessage,
            emoji: '✨',
            type: 'positive',
            created_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching motivation message:', error);
        // Fallback to default message
        setMotivationMessage({
          id: 'default',
          title: 'Daily Motivation',
          content: 'Every step you take towards your goals is progress. Keep pushing forward!',
          emoji: '💪',
          type: 'positive',
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMotivationMessage();
  }, [user]);

  return { motivationMessage, loading };
};
