// src/hooks/useCustomerDetail.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerDetail {
  id: string;
  name: string;
  plan: string;
  profilePicture: string;
  personalInfo: {
    age: number | null;
    gender: string | null;
    height: string;
    weight: string;
  };
  goals: string[];
  preferences: {
    injuries: string[];
    allergies: string[];
    dislikes: string[];
    preferredProgramType: string[];
  };
}

export const useCustomerDetail = (customerId: string | null) => {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomerDetail = async (id: string) => {
    console.log('useCustomerDetail: Fetching customer detail for ID:', id);
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      console.log('useCustomerDetail: Profile query result:', { profile, profileError });

      if (profileError) throw profileError;

      // Fetch onboarding details
      const { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding_details')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      console.log('useCustomerDetail: Onboarding query result:', { onboarding, onboardingError });

      if (onboardingError) throw onboardingError;

      // Transform data to match expected format
      const transformedCustomer: CustomerDetail = {
        id: profile.id,
        name: profile.full_name || 'Unknown Customer',
        plan: profile.plan || 'No Plan',
        profilePicture: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.id}`,
        personalInfo: {
          age: onboarding?.dob ? new Date().getFullYear() - new Date(onboarding.dob).getFullYear() : null,
          gender: onboarding?.gender || null,
          height: onboarding?.height ? `${onboarding.height} cm` : 'Not specified',
          weight: onboarding?.weight ? `${onboarding.weight} kg` : 'Not specified',
        },
        goals: onboarding?.goals || [],
        preferences: {
          injuries: onboarding?.injuries || [],
          allergies: onboarding?.allergies || [],
          dislikes: onboarding?.training_dislikes || [],
          preferredProgramType: determinePreferredPrograms(onboarding?.goals || []),
        },
      };

      setCustomer(transformedCustomer);
    } catch (error) {
      console.error('Error fetching customer detail:', error);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail(customerId);
    } else {
      setCustomer(null);
    }
  }, [customerId]);

  return { customer, loading };
};

// Helper function to determine preferred program types based on goals
const determinePreferredPrograms = (goals: string[]): string[] => {
  const programs = new Set<string>();
  
  goals.forEach(goal => {
    const lowerGoal = goal.toLowerCase();
    if (lowerGoal.includes('weight') || lowerGoal.includes('muscle') || lowerGoal.includes('strength') || lowerGoal.includes('fitness')) {
      programs.add('Fitness');
    }
    if (lowerGoal.includes('nutrition') || lowerGoal.includes('diet') || lowerGoal.includes('eating')) {
      programs.add('Nutrition');
    }
    if (lowerGoal.includes('mental') || lowerGoal.includes('stress') || lowerGoal.includes('mindfulness') || lowerGoal.includes('anxiety')) {
      programs.add('Mental Health');
    }
  });

  return Array.from(programs);
};