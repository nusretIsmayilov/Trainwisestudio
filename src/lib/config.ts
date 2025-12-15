// src/lib/config.ts
// Configuration management for deployment

const getAppUrl = () => {
  // Production domain - hardcoded for www.trainwisestudio.com
  const PRODUCTION_DOMAIN = 'https://www.trainwisestudio.com';
  
  // Always prefer environment variable if set
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // In development, use current origin but warn if it's localhost
  if (import.meta.env.DEV) {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.warn('⚠️ Using localhost URL for magic links. Set VITE_APP_URL for production deployment.');
    }
    return origin;
  }
  
  // In production, use hardcoded domain
  console.log('🚀 Using production domain:', PRODUCTION_DOMAIN);
  return PRODUCTION_DOMAIN;
};

// Get Supabase functions base URL
const getSupabaseFunctionsUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  // Extract project ref from URL (e.g., https://xyz.supabase.co -> xyz)
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  return `${supabaseUrl}/functions/v1`;
};

export const config = {
  appUrl: getAppUrl(),
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key',
    functionsUrl: getSupabaseFunctionsUrl(),
  },
  api: {
    // Use Supabase Edge Functions instead of separate backend
    baseUrl: getSupabaseFunctionsUrl(),
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
} as const;
