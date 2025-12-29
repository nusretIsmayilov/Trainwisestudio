// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  role: 'customer' | 'coach' | null;
  onboarding_complete: boolean;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  plan?: string | null;
  plan_expiry?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  coach_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type AuthState = 'initializing' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  authState: AuthState;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');

  const mountedRef = useRef(true);

  // ✅ SAFE profile fetch (SADECE auth sonrası)
  const fetchProfile = useCallback(async (targetUser: User) => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    // 🚨 CRITICAL GUARD
    if (!currentSession || currentSession.user.id !== targetUser.id) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }

    return data as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) return;

    const profileData = await fetchProfile(currentUser);
    if (mountedRef.current) {
      setProfile(profileData);
    }
  }, [fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setAuthState('authenticated');

        // ⛔️ PROFILE FETCH YOK — signup güvenli
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setAuthState('unauthenticated');
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mountedRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setAuthState('authenticated');
        // ⛔️ profile fetch YOK
      } else {
        setProfile(null);
        setAuthState('unauthenticated');
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthState('unauthenticated');
    }
  };

  const loading = authState === 'initializing';

  const value: AuthContextType = {
    user,
    session,
    profile,
    authState,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
