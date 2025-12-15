import { useAccessLevel } from '@/contexts/AccessLevelContext';

/**
 * Hook to determine library access based on unified AccessLevelContext
 */
export const useLibraryAccess = () => {
  const { hasPaymentPlan, hasCoach, allowedRoutes, isLoading } = useAccessLevel();

  // Still loading
  if (isLoading) {
    return {
      hasAccess: false,
      accessLevel: 'none' as const,
      shouldShowLink: false
    };
  }

  // Check if library is in allowed routes
  const canAccessLibrary = allowedRoutes.includes('library');

  // Full access with payment plan
  if (hasPaymentPlan) {
    return {
      hasAccess: true,
      accessLevel: 'full' as const,
      shouldShowLink: true
    };
  }

  // Limited access with coach only
  if (hasCoach && canAccessLibrary) {
    return {
      hasAccess: true,
      accessLevel: 'limited' as const,
      shouldShowLink: true
    };
  }

  // No access
  return {
    hasAccess: false,
    accessLevel: 'none' as const,
    shouldShowLink: false
  };
};
