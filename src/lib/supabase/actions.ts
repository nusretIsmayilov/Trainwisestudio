// src/lib/supabase/actions.ts
import { supabase } from './client';
import { config } from '@/lib/config';
import { FORCE_PRODUCTION_URLS, logUrlUsage } from '@/lib/force-urls';

export async function sendMagicLink(email: string) {
  // Force production URL even if Supabase dashboard is misconfigured
  const redirectUrl = import.meta.env.PROD 
    ? FORCE_PRODUCTION_URLS.MAGIC_LINK
    : `${config.appUrl}/onboarding/step-1`;
  
  logUrlUsage('Magic Link', redirectUrl);
  
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function sendPasswordResetLink(email: string) {
  // Force production URL even if Supabase dashboard is misconfigured
  const redirectUrl = import.meta.env.PROD 
    ? FORCE_PRODUCTION_URLS.PASSWORD_RESET
    : `${config.appUrl}/update-password`;
  
  logUrlUsage('Password Reset', redirectUrl);
  
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

export async function updateUserPassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

// Check if user already exists
export async function checkUserExists(email: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // User doesn't exist
      return { exists: false, user: null };
    }
    
    if (error) {
      throw error;
    }
    
    return { exists: true, user: data };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, user: null };
  }
}