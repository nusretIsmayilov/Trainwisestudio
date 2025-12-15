import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnhancedCoach {
  id: string;
  name: string;
  email: string;
  bio: string;
  tagline: string;
  avatar_url: string;
  skills: string[];
  certifications: any[];
  socials: any[];
  rating: number;
  reviews: number;
  yearsExperience: number;
  profileImageUrl?: string;
  specialties: string[];
}

export interface CoachRequest {
  id: string;
  customer_id: string;
  coach_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
}

export const useEnhancedCoaches = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<EnhancedCoach[]>([]);
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoaches = async () => {
    try {
      // Use the secure function that excludes sensitive fields like email
      const { data, error } = await supabase
        .rpc('get_public_coach_profiles');

      if (error) throw error;

      const enhancedCoaches: EnhancedCoach[] = data.map(coach => ({
        id: coach.id,
        name: coach.full_name || 'Coach',
        email: '', // Email is not included in public data for security
        bio: coach.bio || 'Experienced fitness and wellness coach ready to help you achieve your goals.',
        tagline: coach.tagline || 'Fitness & Wellness Coach',
        avatar_url: coach.avatar_url || '',
        profileImageUrl: coach.avatar_url || '',
        skills: coach.skills || [],
        certifications: coach.certifications || [],
        socials: coach.socials || [],
        specialties: coach.skills || [],
        rating: 4.8, // TODO: Calculate from reviews
        reviews: 127, // TODO: Count actual reviews
        yearsExperience: 5 // TODO: Calculate from profile data
      }));

      setCoaches(enhancedCoaches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coaches');
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_requests')
        .select('*')
        .eq('customer_id', user.id);

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    }
  };

  const sendRequest = async (coachId: string, message?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Use a default message if none provided
    const requestMessage = message || "I'm interested in working with you as my coach to achieve my fitness and wellness goals.";

    try {
      // Check if active request already exists (pending or accepted)
      const { data: existingRequest } = await supabase
        .from('coach_requests')
        .select('id, status')
        .eq('customer_id', user.id)
        .eq('coach_id', coachId)
        .in('status', ['pending', 'accepted'])
        .single();

      if (existingRequest) {
        throw new Error('You have already sent a request to this coach');
      }

      const { data, error } = await supabase
        .from('coach_requests')
        .insert({
          customer_id: user.id,
          coach_id: coachId,
          message: requestMessage,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Coach request error:', error);
        throw new Error(`Failed to send request: ${error.message}`);
      }

      // Refresh requests
      await fetchRequests();
      return data;
    } catch (err) {
      console.error('Send request error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to send request');
    }
  };

  const getRequestStatus = (coachId: string): 'pending' | 'accepted' | 'rejected' | null => {
    const request = requests.find(r => r.coach_id === coachId);
    return request ? request.status : null;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCoaches(), fetchRequests()]);
      setLoading(false);
    };

    initializeData();
  }, [user]);

  return {
    coaches,
    requests,
    loading,
    error,
    sendRequest,
    getRequestStatus,
    refetch: () => Promise.all([fetchCoaches(), fetchRequests()])
  };
};