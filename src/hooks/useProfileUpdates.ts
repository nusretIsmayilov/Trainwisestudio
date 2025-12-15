import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface UpdateOnboardingPayload {
  goals?: string[];
  location?: string | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  dob?: string | null;
  country?: string | null;
  allergies?: string[];
  training_likes?: string[];
  training_dislikes?: string[];
  injuries?: string[];
  meditation_experience?: string | null;
}

export const useProfileUpdates = () => {
  const { user, refreshProfile } = useAuth();
  const { update: queueUpdate, upsert: queueUpsert } = useTableMutations('profiles');
  const { upsert: queueOnboardingUpsert } = useTableMutations('onboarding_details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: UpdateProfilePayload) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      console.log('Updating profile with payload:', payload);
      console.log('User ID:', user.id);
      
      // First, let's check if the profile exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Existing profile data:', existingProfile);
      if (selectError) {
        console.error('Error fetching existing profile:', selectError);
      }
      
      // Use mutation queue for offline support and scalability
      try {
        await queueUpdate(
          {
            full_name: payload.full_name,
            phone: payload.phone,
            avatar_url: payload.avatar_url,
          },
          { id: user.id },
          {
            invalidateQueries: [queryKeys.profile(user.id)],
          }
        );
        
        console.log('Profile update queued successfully');
        await refreshProfile();
        return true;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct update:', queueError);
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: payload.full_name,
            phone: payload.phone,
            avatar_url: payload.avatar_url,
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Supabase error updating profile:', error);
          throw error;
        }
        
        console.log('Profile update successful');
        await refreshProfile();
        return true;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update profile';
      console.error('Error updating profile:', e);
      setError(message);
      throw e; // Re-throw to allow proper error handling in components
    } finally {
      setLoading(false);
    }
  };

  const updateOnboarding = async (payload: UpdateOnboardingPayload) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      console.log('Updating onboarding with payload:', payload);
      console.log('User ID:', user.id);
      
      // First, let's try to see if there's an existing record
      const { data: existingData, error: selectError } = await supabase
        .from('onboarding_details')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('Existing onboarding data:', existingData);
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error fetching existing data:', selectError);
      }
      
      // Use mutation queue for offline support and scalability
      try {
        await queueOnboardingUpsert(
          {
            user_id: user.id,
            goals: payload.goals,
            location: payload.location,
            weight: payload.weight,
            height: payload.height,
            gender: payload.gender,
            dob: payload.dob,
            country: payload.country,
            allergies: payload.allergies,
            training_likes: payload.training_likes,
            training_dislikes: payload.training_dislikes,
            injuries: payload.injuries,
            meditation_experience: payload.meditation_experience,
          },
          'user_id',
          {
            invalidateQueries: [queryKeys.profile(user.id)],
          }
        );
        
        console.log('Onboarding update queued successfully');
        // Return optimistic data
        return {
          user_id: user.id,
          goals: payload.goals,
          location: payload.location,
          weight: payload.weight,
          height: payload.height,
          gender: payload.gender,
          dob: payload.dob,
          country: payload.country,
          allergies: payload.allergies,
          training_likes: payload.training_likes,
          training_dislikes: payload.training_dislikes,
          injuries: payload.injuries,
          meditation_experience: payload.meditation_experience,
        } as any;
      } catch (queueError) {
        // Fallback to direct Supabase call if queue fails
        console.warn('Queue failed, falling back to direct upsert:', queueError);
        const { data, error } = await supabase
          .from('onboarding_details')
          .upsert({
            user_id: user.id,
            goals: payload.goals,
            location: payload.location,
            weight: payload.weight,
            height: payload.height,
            gender: payload.gender,
            dob: payload.dob,
            country: payload.country,
            allergies: payload.allergies,
            training_likes: payload.training_likes,
            training_dislikes: payload.training_dislikes,
            injuries: payload.injuries,
            meditation_experience: payload.meditation_experience,
          }, { onConflict: 'user_id' })
          .select('*')
          .single();
        
        if (error) {
          console.error('Supabase error updating onboarding:', error);
          throw error;
        }
        
        console.log('Onboarding update successful:', data);
        return data;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update onboarding';
      console.error('Error updating onboarding:', e);
      setError(message);
      throw e; // Re-throw to allow proper error handling in components
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, updateOnboarding, loading, error };
};


