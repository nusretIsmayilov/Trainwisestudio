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
  
  return info;
};

// Auto-debug in development
if (import.meta.env.DEV) {
  debugUrls();
}
