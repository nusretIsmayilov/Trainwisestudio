import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

const CACHE_KEY = 'auth_session_cache';

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ isOnline: true, wasOffline: prev.wasOffline || !prev.isOnline }));
    };

    const handleOffline = () => {
      setStatus({ isOnline: false, wasOffline: true });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheAuthState = useCallback((userId: string | null, role: string | null) => {
    try {
      if (userId && role) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, role, timestamp: Date.now() }));
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const getCachedAuthState = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache valid for 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        }
        localStorage.removeItem(CACHE_KEY);
      }
    } catch {
      // localStorage not available
    }
    return null;
  }, []);

  return {
    ...status,
    cacheAuthState,
    getCachedAuthState,
  };
};
