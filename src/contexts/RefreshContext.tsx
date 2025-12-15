import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';

interface RefreshContextType {
  refreshProfile: () => Promise<void>;
  refreshPaymentPlan: () => Promise<void>;
  refreshAll: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  shouldPreserveState: boolean;
  setShouldPreserveState: (preserve: boolean) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

interface RefreshProviderProps {
  children: React.ReactNode;
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [shouldPreserveState, setShouldPreserveState] = useState(false);
  const { refreshProfile } = useAuth();
  const { refreshPaymentPlan } = usePaymentPlan();

  // Track visibility changes to detect browser close/lock
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Browser is being closed, minimized, or locked
        setShouldPreserveState(true);
      } else {
        // Browser is being opened/restored
        // Reset preserve state after a short delay to allow for normal refreshes
        setTimeout(() => {
          setShouldPreserveState(false);
        }, 1000);
      }
    };

    const handleBeforeUnload = () => {
      // Page is being unloaded (browser close, navigation)
      setShouldPreserveState(true);
    };

    const handleFocus = () => {
      // Page is being focused (coming back from another tab)
      if (shouldPreserveState) {
        // Reset preserve state after a short delay
        setTimeout(() => {
          setShouldPreserveState(false);
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
    };
  }, [shouldPreserveState]);

  const refreshProfileData = useCallback(async () => {
    if (shouldPreserveState) {
      console.log('Skipping profile refresh to preserve state');
      return;
    }

    try {
      setIsRefreshing(true);
      await refreshProfile();
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile, shouldPreserveState]);

  const refreshPaymentPlanData = useCallback(async () => {
    if (shouldPreserveState) {
      console.log('Skipping payment plan refresh to preserve state');
      return;
    }

    try {
      setIsRefreshing(true);
      await refreshPaymentPlan();
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error refreshing payment plan:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPaymentPlan, shouldPreserveState]);

  const refreshAll = useCallback(async () => {
    if (shouldPreserveState) {
      console.log('Skipping full refresh to preserve state');
      return;
    }

    try {
      setIsRefreshing(true);
      await Promise.all([
        refreshProfile(),
        refreshPaymentPlan()
      ]);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error refreshing all data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile, refreshPaymentPlan, shouldPreserveState]);

  const value: RefreshContextType = {
    refreshProfile: refreshProfileData,
    refreshPaymentPlan: refreshPaymentPlanData,
    refreshAll,
    isRefreshing,
    lastRefreshTime,
    shouldPreserveState,
    setShouldPreserveState
  };

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
};
