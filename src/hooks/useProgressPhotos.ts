import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface ProgressPhoto {
  id: string;
  image_url: string;
  date: string;
  notes?: string;
  created_at: string;
}

export const useProgressPhotos = () => {
  const { user } = useAuth();
  const { refreshAll } = useRefresh();
  const { insert: queueInsert } = useTableMutations('progress_photos');
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress photos');
    } finally {
      setLoading(false);
    }
  };

  const addProgressPhoto = async (imageUrl: string, notes?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Use mutation queue for offline support and scalability
      try {
        await queueInsert(
          {
            user_id: user.id,
            image_url: imageUrl,
            date: new Date().toISOString().split('T')[0],
            notes: notes || null,
          },
          {
            invalidateQueries: [queryKeys.profile(user.id)],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: `temp_${Date.now()}`,
          user_id: user.id,
          image_url: imageUrl,
          date: new Date().toISOString().split('T')[0],
          notes: notes || null,
          created_at: new Date().toISOString(),
        } as ProgressPhoto;
        
        // Update local state
        setPhotos(prev => [optimisticData, ...prev]);
        await refreshAll();
        
        return optimisticData;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct insert:', queueError);
        const { data, error } = await supabase
          .from('progress_photos')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            date: new Date().toISOString().split('T')[0],
            notes
          })
          .select()
          .single();

        if (error) throw error;

        setPhotos(prev => [data, ...prev]);
        await refreshAll();
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add progress photo');
      throw err;
    }
  };

  const getLatestPhoto = () => {
    return photos.length > 0 ? photos[0] : null;
  };

  const getPhotoHistory = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return photos.filter(photo => 
      new Date(photo.date) >= cutoffDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  return {
    photos,
    loading,
    error,
    addProgressPhoto,
    getLatestPhoto,
    getPhotoHistory,
    refetch: fetchPhotos
  };
};
