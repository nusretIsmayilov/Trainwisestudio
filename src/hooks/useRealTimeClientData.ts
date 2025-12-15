import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  plan: string;
  plan_expiry: string;
  phone: string;
  personalInfo: {
    age: number | null;
    height: string;
    weight: string;
    gender: string;
  };
  goals: string[];
  preferences: {
    injuries: string[];
    allergies: string[];
    dislikes: string[];
    likes: string[];
    meditationExperience: string;
  };
  programs: {
    id: string;
    name: string;
    status: 'active' | 'scheduled' | 'completed';
    startDate?: string;
    type: 'fitness' | 'nutrition' | 'mental_health';
  }[];
  adherence: number; // percentage
  programDays: {
    total: number;
    completed: number;
    remaining: number;
  };
  membership: {
    hasPaymentPlan: boolean;
    daysLeft: number;
    startDate?: string;
  };
  dailyCheckin: {
    today: {
      mood: number;
      energy: number;
      stress: number;
      sleep: number;
    };
    trend: {
      mood: number;
      energy: number;
      stress: number;
      sleep: number;
    };
  };
  weightJourney: {
    hasData: boolean;
    currentWeight: number;
    weightChange: number;
    entries: Array<{
      date: string;
      weight: number;
    }>;
  };
  programTrends: {
    fitness: {
      hasProgram: boolean;
      hasData: boolean;
      data: any[];
    };
    nutrition: {
      hasProgram: boolean;
      hasData: boolean;
      data: any[];
    };
    mentalHealth: {
      hasProgram: boolean;
      hasData: boolean;
      data: any[];
    };
  };
  checkinHistory: Array<{
    id: string;
    date: string;
    message: string;
    response?: string;
    rating?: number;
    status: 'pending' | 'responded';
  }>;
}

export const useRealTimeClientData = (clientId?: string) => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientData = async (id?: string) => {
    if (!user || !id) return;

    try {
      setLoading(true);
      
      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, plan, plan_expiry, phone, coach_id')
        .eq('id', id)
        .eq('coach_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Get onboarding details
      const { data: onboarding } = await supabase
        .from('onboarding_details')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      // Get programs
      const { data: programs } = await supabase
        .from('programs')
        .select('id, name, status, scheduled_date, category')
        .eq('assigned_to', id)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate adherence based on program entries
      const { data: programEntries } = await supabase
        .from('program_entries')
        .select('created_at')
        .eq('user_id', id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate adherence based on actual program completion
      const totalExpectedDays = 30; // 30-day program period
      const uniqueDays = new Set(programEntries?.map(entry => 
        new Date(entry.created_at).toDateString()
      )).size;
      const adherence = Math.min(100, Math.round((uniqueDays / totalExpectedDays) * 100));

      // Calculate program days
      const activePrograms = programs?.filter(p => p.status === 'active') || [];
      const totalDays = activePrograms.length > 0 ? 30 : 0; // Assuming 30-day programs
      const completedDays = programEntries?.length || 0;
      const remainingDays = Math.max(0, totalDays - completedDays);

      // Check membership status - only show time left when program is started
      const hasPaymentPlan = !!profile.plan && profile.plan !== 'Free';
      const planExpiry = profile.plan_expiry ? new Date(profile.plan_expiry) : null;
      
      // Check if any program has been started (assigned or scheduled)
      const hasStartedProgram = programs?.some(p => p.status === 'active' || p.status === 'scheduled');
      const daysLeft = (hasPaymentPlan && hasStartedProgram && planExpiry) 
        ? Math.max(0, Math.ceil((planExpiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) 
        : 0;

      // Get daily check-in data - use daily_checkins table
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCheckin } = await supabase
        .from('daily_checkins')
        .select('mood, energy, sleep_hours')
        .eq('user_id', id)
        .eq('date', today)
        .maybeSingle();

      const { data: checkinHistory } = await supabase
        .from('daily_checkins')
        .select('mood, energy, sleep_hours, date, created_at')
        .eq('user_id', id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Calculate trends
      const calculateTrend = (field: string) => {
        if (!checkinHistory || checkinHistory.length < 2) return 0;
        const recent = checkinHistory.slice(0, 3).reduce((sum, entry) => sum + (entry[field] || 0), 0) / 3;
        const older = checkinHistory.slice(3, 6).reduce((sum, entry) => sum + (entry[field] || 0), 0) / 3;
        return recent - older;
      };

      // Note: stress is not in daily_checkins table, so we'll default to 0

      // Get weight data - note: RLS may prevent coach from viewing client data
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('weight_kg, date, created_at')
        .eq('user_id', id)
        .order('date', { ascending: false });

      // Log error but don't throw - RLS might block coach access
      if (weightError) {
        console.warn('Weight entries query error (may be RLS):', weightError);
      }

      const currentWeight = weightEntries?.[0]?.weight_kg || 0;
      const previousWeight = weightEntries?.[1]?.weight_kg || 0;
      const weightChange = currentWeight - previousWeight;

      // Check program-specific trends
      const fitnessProgram = programs?.find(p => p.category === 'fitness');
      const nutritionProgram = programs?.find(p => p.category === 'nutrition');
      const mentalHealthProgram = programs?.find(p => p.category === 'mental health');

      // Get program-specific data - only query if program exists
      const [fitnessDataResult, nutritionDataResult, mentalHealthDataResult] = await Promise.all([
        fitnessProgram?.id
          ? supabase
              .from('program_entries')
              .select('*')
              .eq('user_id', id)
              .eq('program_id', fitnessProgram.id)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          : Promise.resolve({ data: null, error: null }),
        nutritionProgram?.id
          ? supabase
              .from('program_entries')
              .select('*')
              .eq('user_id', id)
              .eq('program_id', nutritionProgram.id)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          : Promise.resolve({ data: null, error: null }),
        mentalHealthProgram?.id
          ? supabase
              .from('program_entries')
              .select('*')
              .eq('user_id', id)
              .eq('program_id', mentalHealthProgram.id)
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          : Promise.resolve({ data: null, error: null }),
      ]);

      const fitnessData = fitnessDataResult.data;
      const nutritionData = nutritionDataResult.data;
      const mentalHealthData = mentalHealthDataResult.data;

      // Get check-in history (coach check-ins)
      const { data: coachCheckins } = await supabase
        .from('coach_checkins')
        .select('id, message, status, created_at')
        .eq('customer_id', id)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate age
      const calculateAge = (dob: string | null) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      setClientData({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        plan: profile.plan,
        plan_expiry: profile.plan_expiry,
        phone: profile.phone,
        personalInfo: {
          age: calculateAge(onboarding?.dob),
          height: onboarding?.height ? `${onboarding.height} cm` : 'Not provided',
          weight: onboarding?.weight ? `${onboarding.weight} kg` : 'Not provided',
          gender: onboarding?.gender || 'Not provided',
        },
        goals: onboarding?.goals || [],
        preferences: {
          injuries: onboarding?.injuries || [],
          allergies: onboarding?.allergies || [],
          dislikes: onboarding?.training_dislikes || [],
          likes: onboarding?.training_likes || [],
          meditationExperience: onboarding?.meditation_experience || 'Not specified',
        },
        programs: (programs || []).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status as 'active' | 'scheduled' | 'completed',
          startDate: p.scheduled_date,
          type: (p.category === 'mental health' ? 'mental_health' : p.category) as 'fitness' | 'nutrition' | 'mental_health',
        })),
        adherence,
        programDays: {
          total: totalDays,
          completed: completedDays,
          remaining: remainingDays,
        },
        membership: {
          hasPaymentPlan,
          daysLeft,
          startDate: hasPaymentPlan ? profile.plan_expiry : undefined,
        },
        dailyCheckin: {
          today: {
            mood: todayCheckin?.mood || 0,
            energy: todayCheckin?.energy || 0,
            stress: 0, // Not tracked in daily_checkins
            sleep: todayCheckin?.sleep_hours || 0,
          },
          trend: {
            mood: calculateTrend('mood'),
            energy: calculateTrend('energy'),
            stress: 0, // Not tracked in daily_checkins
            sleep: calculateTrend('sleep_hours'),
          },
        },
        weightJourney: {
          hasData: hasPaymentPlan && weightEntries && weightEntries.length > 0,
          currentWeight,
          weightChange,
          entries: (weightEntries || []).map(entry => ({
            date: entry.date || entry.created_at,
            weight: entry.weight_kg,
          })),
        },
        programTrends: {
          fitness: {
            hasProgram: !!fitnessProgram,
            hasData: !!fitnessData && fitnessData.length > 0,
            data: fitnessData || [],
          },
          nutrition: {
            hasProgram: !!nutritionProgram,
            hasData: !!nutritionData && nutritionData.length > 0,
            data: nutritionData || [],
          },
          mentalHealth: {
            hasProgram: !!mentalHealthProgram,
            hasData: !!mentalHealthData && mentalHealthData.length > 0,
            data: mentalHealthData || [],
          },
        },
        checkinHistory: (coachCheckins || []).map(checkin => ({
          id: checkin.id,
          date: checkin.created_at,
          message: checkin.message,
          response: (checkin as any).response || null,
          rating: (checkin as any).rating || null,
          status: checkin.status as 'pending' | 'responded',
        })),
      });

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientData(clientId);
    }
  }, [clientId, user]);

  return {
    clientData,
    loading,
    refreshData: () => fetchClientData(clientId)
  };
};
