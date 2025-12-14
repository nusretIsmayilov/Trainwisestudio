import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

export interface SocialLink {
  id: string;
  platform: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Twitter' | 'TikTok' | 'Facebook' | 'Website';
  url: string;
}

export interface CoachProfile {
  id?: string;
  full_name: string;
  email?: string;
  tagline: string;
  bio: string;
  avatar_url: string;
  skills: string[];
  certifications: Certification[];
  socials: SocialLink[];
  price_min_cents?: number | null;
  price_max_cents?: number | null;
}

export const useCoachProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'coach')
        .single();

      if (error) throw error;

      if (data) {
        const transformedProfile: CoachProfile = {
          id: data.id,
          full_name: data.full_name || '',
          email: data.email || '',
          tagline: data.tagline || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          skills: data.skills || [],
          certifications: data.certifications || [],
          socials: data.socials || [],
          price_min_cents: data.price_min_cents || null,
          price_max_cents: data.price_max_cents || null
        };
        setProfile(transformedProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: Partial<CoachProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.full_name,
          tagline: updatedProfile.tagline,
          bio: updatedProfile.bio,
          avatar_url: updatedProfile.avatar_url,
          skills: updatedProfile.skills,
          certifications: updatedProfile.certifications,
          socials: updatedProfile.socials,
          price_min_cents: updatedProfile.price_min_cents,
          price_max_cents: updatedProfile.price_max_cents
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};