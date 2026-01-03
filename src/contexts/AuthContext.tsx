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
import { useNavigate } from 'react-router-dom'; // ✅ EKLENDİ

export interface Profile {
  id: string;
  role: 'customer' | 'coach';
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
  role_selected: boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate(); // ✅ EKLENDİ

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');

  const initialLoadComplete = useRef(false);
  const pendingProfileFetch = useRef<Promise<Profile | null> | null>(null);
  const hasRedirected = useRef(false); // ✅ EKLENDİ (loop önler)

  const fetchProfile = useCallback(async (targetUser: User): Promise<Profile | null> => {
    if (pendingProfileFetch.current) {
      return pendingProfileFetch.current;
    }

    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newData, error: newError } = await supabase
            .from('profiles')
            .insert({
              id: targetUser.id,
              email: targetUser.email,
              role: 'customer',
            })
            .select()
            .single();

          if (newError) return null;
          return newData as Profile;
        }

        if (error) return null;
        return data as Profile;
      } finally {
        pendingProfileFetch.current = null;
      }
    })();

    pendingProfileFetch.current = fetchPromise;
    return fetchPromise;
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const profileData = await fetchProfile(currentUser);
      setProfile(profileData);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        const prof = await fetchProfile(session.user);
        setProfile(prof);
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }

      initialLoadComplete.current = true;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!initialLoadComplete.current) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          fetchProfile(newSession.user).then(setProfile);
          setAuthState('authenticated');
        } else {
          setProfile(null);
          setAuthState('unauthenticated');
        }
      }
    );

    init();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ✅ 🔥 ASIL ÇÖZÜM BURADA
  useEffect(() => {
  if (
    authState !== 'authenticated' ||
    !profile ||
    hasRedirected.current
  ) {
    return;
  }

  if (profile.role === 'coach' && profile.onboarding_complete) {
    hasRedirected.current = true;
    navigate('/coach/dashboard', { replace: true });
  }
}, [authState, profile, navigate]);


  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthState('unauthenticated');
    hasRedirected.current = false; // reset
  };

  const loading = authState === 'initializing';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        authState,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
