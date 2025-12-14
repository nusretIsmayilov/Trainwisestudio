// src/contexts/OnboardingContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PersonalInfo {
  name: string;
  weight: number;
  height: number;
  gender: string;
  dob: string;
  country: string;
  year: string;
  month: string;
  day: string;
  weight_lbs: string;
  height_ft: string;
  height_in: string;
  weight_kg: string;
  height_cm: string;
}

interface Preferences {
  allergies: string[];
  trainingLikes: string[];
  trainingDislikes: string[];
  injuries: string[];
  meditationExperience: string;
}

interface ContactInfo {
  avatarFile: File | null;
  avatarPreview: string | null;
  phone: string;
  password: string;
}

interface OnboardingState {
  goals: string[];
  personalInfo: PersonalInfo;
  preferences: Preferences;
  contactInfo: ContactInfo;
}

interface OnboardingContextValue {
  state: OnboardingState;
  loading: boolean;
  updateState: (step: keyof OnboardingState, data: any) => void;
  completeOnboarding: () => Promise<void>;
  clearState: () => void;
}

const initialOnboardingState: OnboardingState = {
  goals: [],
  personalInfo: { 
    name: '', 
    weight: 0, 
    height: 0, 
    gender: '', 
    dob: '', 
    country: '',
    year: '',
    month: '',
    day: '',
    weight_lbs: '',
    height_ft: '',
    height_in: '',
    weight_kg: '',
    height_cm: ''
  },
  preferences: { 
    allergies: [], 
    trainingLikes: [], 
    trainingDislikes: [], 
    injuries: [], 
    meditationExperience: '' 
  },
  contactInfo: { 
    avatarFile: null, 
    avatarPreview: null, 
    phone: '', 
    password: '' 
  },
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [state, setState] = useState(initialOnboardingState);
  const [loading, setLoading] = useState(false);

  // Rehydrate from localStorage to prevent losing progress on route changes/hard reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(prev => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (profile) {
      setState(prevState => ({
        ...prevState,
        personalInfo: { ...prevState.personalInfo, name: profile.full_name || '' },
        contactInfo: { ...prevState.contactInfo, avatarPreview: profile.avatar_url || null }
      }));
    }
  }, [profile]);

  const updateState = useCallback((step: keyof OnboardingState, data: any) => {
    setState(prevState => {
      const next = { ...prevState, [step]: data } as OnboardingState;
      try { localStorage.setItem('onboarding_state', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearState = useCallback(() => setState(initialOnboardingState), []);

  const completeOnboarding = async (): Promise<void> => {
    if (!user) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    setLoading(true);

    try {
      let avatar_url = profile?.avatar_url;
      
      // Handle avatar upload if provided
      if (state.contactInfo.avatarFile) {
        try {
          const file = state.contactInfo.avatarFile;
          const filePath = `${user.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
          
          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            toast.error('Failed to upload avatar. Continuing without it.');
          } else {
            avatar_url = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
          }
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          toast.error('Failed to upload avatar. Continuing without it.');
        }
      }

      // Password is required - validate it
      if (!state.contactInfo.password || state.contactInfo.password.length < 6) {
        throw new Error('Password is required and must be at least 6 characters long.');
      }

      // Update password (required)
      try {
        const { error: passwordError } = await supabase.auth.updateUser({ password: state.contactInfo.password });
        if (passwordError) {
          console.error('Password update error:', passwordError);
          throw new Error('Failed to update password. Please try again.');
        }
      } catch (passwordError) {
        console.error('Password update error:', passwordError);
        const errorMessage = passwordError instanceof Error ? passwordError.message : 'Failed to update password. Please try again.';
        throw new Error(errorMessage);
      }

      // Update profile
      const profileUpdate = {
        full_name: state.personalInfo.name,
        avatar_url,
        phone: state.contactInfo.phone,
        onboarding_complete: true,
      };
      
      const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error('Failed to update profile. Please try again.');
      }

      // Update onboarding details
      const detailsUpdate = {
        user_id: user.id,
        weight: state.personalInfo.weight,
        height: state.personalInfo.height,
        gender: state.personalInfo.gender,
        dob: state.personalInfo.dob || null,
        country: state.personalInfo.country,
        goals: state.goals,
        allergies: state.preferences.allergies,
        training_likes: state.preferences.trainingLikes,
        training_dislikes: state.preferences.trainingDislikes,
        injuries: state.preferences.injuries,
        meditation_experience: state.preferences.meditationExperience,
      };
      
      const { error: detailsError } = await supabase.from('onboarding_details').upsert(detailsUpdate, { onConflict: 'user_id' });
      if (detailsError) {
        console.error('Onboarding details update error:', detailsError);
        throw new Error('Failed to save preferences. Please try again.');
      }

      // Refresh the profile to update the auth state with new data
      await refreshProfile();
      toast.success("Welcome! Your profile is complete.");
      try { localStorage.removeItem('onboarding_state'); } catch {}
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error(error.message || "Could not complete setup. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = { state, loading, updateState, completeOnboarding, clearState };
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};