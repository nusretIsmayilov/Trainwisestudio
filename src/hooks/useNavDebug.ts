import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLevel } from '@/contexts/AccessLevelContext';

/**
 * Dev-only navigation debug logging
 * Logs current role, access state, route allowance, and namespace
 */
export const useNavDebug = () => {
  const { profile } = useAuth();
  const access = useAccessLevel();
  const location = useLocation();

  useEffect(() => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    const canAccess = access.canAccessRoute(location.pathname);
    const denialReason = access.getAccessDenialReason(location.pathname);
    const namespace = location.pathname.startsWith('/coach') 
      ? 'coach' 
      : location.pathname.startsWith('/customer') 
        ? 'customer' 
        : 'public';

    console.group(`[Nav Debug] ${location.pathname}`);
    console.log('Role:', access.role ?? 'unauthenticated');
    console.log('Access Case:', access.accessLevel);
    console.log('Namespace:', namespace);
    console.log('Can Access:', canAccess);
    if (denialReason) {
      console.log('Denial Reason:', denialReason);
    }
    console.log('Allowed Routes:', access.allowedRoutes);
    console.log('Denied Routes:', access.deniedRoutes);
    console.log('Flags:', {
      hasCoach: access.hasCoach,
      hasPaymentPlan: access.hasPaymentPlan,
      hasTrial: access.hasTrial,
      hasSubscription: access.hasSubscription,
    });
    console.groupEnd();
  }, [location.pathname, access, profile]);
};
