// src/lib/debug.ts
// Debug utilities for URL and environment issues

export const debugUrls = () => {
  const info = {
    currentOrigin: window.location.origin,
    currentHost: window.location.host,
    currentProtocol: window.location.protocol,
    environment: {
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
      mode: import.meta.env.MODE,
    },
    envVars: {
      VITE_APP_URL: import.meta.env.VITE_APP_URL,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_PROXY_TARGET: import.meta.env.VITE_API_PROXY_TARGET,
    },
    config: {
      appUrl: import.meta.env.VITE_APP_URL || (import.meta.env.PROD ? 'https://www.trainwisestudio.com' : window.location.origin),
      hardcodedDomain: 'https://www.trainwisestudio.com',
    }
  };

  console.group('🔍 URL Debug Information');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', info.currentOrigin);
  console.log('Environment:', info.environment);
  console.log('Environment Variables:', info.envVars);
  console.log('Config App URL:', info.config.appUrl);
  
  if (info.currentOrigin.includes('localhost') && import.meta.env.PROD) {
    console.error('❌ Production build is using localhost! Set VITE_APP_URL environment variable.');
  }
  
  if (!import.meta.env.VITE_APP_URL && import.meta.env.PROD) {
    console.log('✅ Using hardcoded production domain: www.trainwisestudio.com');
  }
  
  console.groupEnd();
  
  return info;
};

// Auto-debug in development
if (import.meta.env.DEV) {
  debugUrls();
}
