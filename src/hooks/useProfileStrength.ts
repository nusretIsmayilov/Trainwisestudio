import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateProfileStrength, ProfileStrengthData, ProfileStrengthCriteria } from '@/lib/coach/profile-strength';

export const useProfileStrength = () => {
  const { user, profile } = useAuth();
  const [strengthData, setStrengthData] = useState<ProfileStrengthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile || profile.role !== 'coach') {
      setStrengthData(null);
      return;
    }

    calculateStrength();
  }, [user, profile]);

  const calculateStrength = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch additional coach data
      const { data: coachData, error: coachError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'coach')
        .single();

      if (coachError) {
        throw coachError;
      }

      // Check for testimonials
      const { data: testimonials } = await supabase
        .from('coach_reviews')
        .select('id')
        .eq('coach_id', user.id)
        .limit(1);

      // Check for portfolio/work samples (assuming we have a coach_portfolio table)
      const { data: portfolio } = await supabase
        .from('coach_portfolio')
        .select('id')
        .eq('coach_id', user.id)
        .limit(1);

      // Build criteria
      const criteria: ProfileStrengthCriteria = {
        hasBio: Boolean(coachData?.bio && coachData.bio.length > 50),
        hasAvatar: Boolean(coachData?.avatar_url),
        hasSkills: Boolean(coachData?.skills && coachData.skills.length > 0),
        hasCertifications: Boolean(coachData?.certifications && coachData.certifications.length > 0),
        hasSocialLinks: Boolean(coachData?.socials && coachData.socials.length > 0),
        hasPricing: Boolean(coachData?.price_min_cents || coachData?.price_max_cents),
        hasExperience: Boolean(coachData?.experience_years && coachData.experience_years > 0),
        hasSpecialties: Boolean(coachData?.specialties && coachData.specialties.length > 0),
        hasTestimonials: Boolean(testimonials && testimonials.length > 0),
        hasPortfolio: Boolean(portfolio && portfolio.length > 0),
      };

      const strength = calculateProfileStrength(criteria);
      setStrengthData(strength);
    } catch (err) {
      console.error('Error calculating profile strength:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate profile strength');
    } finally {
      setLoading(false);
    }
  };

  return {
    strengthData,
    loading,
    error,
    refetch: calculateStrength
  };
};
