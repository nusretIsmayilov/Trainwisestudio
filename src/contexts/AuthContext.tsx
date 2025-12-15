// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

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
}

export type AuthState = 'initializing' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  authState: AuthState;
  loading: boolean; // Deprecated: use authState instead
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache key for session persistence
const SESSION_CACHE_KEY = 'auth_session_cached';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');
  
  // Track if initial load is complete
  const initialLoadComplete = useRef(false);
  // Track pending profile fetches to prevent duplicates
  const pendingProfileFetch = useRef<Promise<Profile | null> | null>(null);

  const fetchProfile = useCallback(async (targetUser: User): Promise<Profile | null> => {
    // Prevent duplicate fetches
    if (pendingProfileFetch.current) {
      return pendingProfileFetch.current;
    }

    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', targetUser.id).single();
        
        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it (self-healing)
          console.log('Profile not found, creating new profile for user:', targetUser.id);
          const { data: newData, error: newError } = await supabase
            .from('profiles')
            .insert({ 
              id: targetUser.id, 
              email: targetUser.email, 
              role: 'customer' 
            })
            .select()
            .single();
          
          if (newError) {
            console.error('Error creating profile:', newError.message);
            return null;
          }

          // Ensure customer record exists
          try {
            await supabase
              .from('customers')
              .upsert({ id: targetUser.id, email: targetUser.email ?? null }, { onConflict: 'id' });
          } catch (e) {
            console.warn('Non-fatal: failed to upsert into customers for new profile', e);
          }
          return newData as Profile;
        }
        
        if (error) {
          console.error('Error fetching profile:', error.message);
          return null;
        }
        
        const prof = data as Profile;
        // Keep customers table in sync for customer role
        if (prof.role === 'customer') {
          try {
            await supabase
              .from('customers')
              .upsert({ id: targetUser.id, email: targetUser.email ?? null }, { onConflict: 'id' });
          } catch (e) {
            console.warn('Non-fatal: failed to upsert into customers', e);
          }
        }
        return prof;
      } catch (error) {
        console.error('Unexpected error in fetchProfile:', error);
        return null;
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

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch profile
          const profileData = await fetchProfile(currentSession.user);
          if (mounted) {
            setProfile(profileData);
            setAuthState('authenticated');
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthState('unauthenticated');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthState('unauthenticated');
        }
      } finally {
        if (mounted) {
          initialLoadComplete.current = true;
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only process events after initial load to prevent double-processing
      if (!initialLoadComplete.current) return;

      if (!mounted) return;

      // Synchronously update session and user
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Fetch profile in the background without blocking
        fetchProfile(newSession.user).then((profileData) => {
          if (mounted) {
            setProfile(profileData);
            setAuthState('authenticated');
          }
        });
      } else {
        setProfile(null);
        setAuthState('unauthenticated');
      }
    });

    // Initialize
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      // Clear payment modal session storage on logout
      sessionStorage.removeItem('paymentModalDismissed');
      sessionStorage.removeItem('paymentModalShown');
      
      // Force local session clear regardless of server response
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthState('unauthenticated');
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error during signOut:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthState('unauthenticated');
    }
  };

  // Derive loading from authState for backward compatibility
  const loading = authState === 'initializing';

  const value = { 
    user, 
    session,
    profile, 
    authState,
    loading, 
    signOut, 
    refreshProfile 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
