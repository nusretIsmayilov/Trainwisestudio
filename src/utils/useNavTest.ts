import { useAccessLevel } from '@/contexts/AccessLevelContext';

/**
 * Testing utilities for navigation access rules
 * Uses the unified AccessLevelContext - no duplicate logic
 */
export const useNavTest = () => {
  const { 
    accessLevel, 
    role,
    hasCoach, 
    hasPaymentPlan, 
    hasTrial, 
    hasSubscription,
    allowedRoutes,
    deniedRoutes,
    canAccessRoute,
    getAccessDenialReason,
  } = useAccessLevel();

  const assertCanNavigate = (path: string): { success: boolean; message: string } => {
    const canAccess = canAccessRoute(path);
    return {
      success: canAccess,
      message: canAccess 
        ? `✅ Can navigate to ${path}` 
        : `❌ Cannot navigate to ${path} (case: ${accessLevel})`,
    };
  };

  const assertCannotNavigate = (path: string): { success: boolean; message: string } => {
    const result = assertCanNavigate(path);
    return {
      success: !result.success,
      message: !result.success 
        ? `✅ Correctly blocked from ${path}` 
        : `❌ Should NOT be able to navigate to ${path} but can`,
    };
  };

  const runAccessTests = () => {
    console.group(`[Nav Test] Access Case: ${accessLevel}`);
    console.log('Current State:', { 
      role, 
      hasCoach, 
      hasPaymentPlan, 
      hasTrial, 
      hasSubscription 
    });
    console.log('Allowed Routes:', allowedRoutes);
    console.log('Denied Routes:', deniedRoutes);
    
    // Test all customer paths
    const testPaths = [
      '/customer/home',
      '/customer/dashboard',
      '/customer/programs',
      '/customer/programs/123',
      '/customer/progress',
      '/customer/progress/chart/weekly',
      '/customer/library',
      '/customer/messages',
      '/customer/my-coach',
      '/customer/blog',
      '/customer/settings',
    ];
    
    console.group('Route Access Tests:');
    testPaths.forEach(path => {
      const result = assertCanNavigate(path);
      const reason = getAccessDenialReason(path);
      console.log(result.message, reason ? `(Reason: ${reason})` : '');
    });
    console.groupEnd();
    
    // Cross-namespace test
    console.group('Cross-Namespace Tests:');
    if (role === 'customer') {
      console.log(assertCannotNavigate('/coach/home').message);
      console.log(assertCannotNavigate('/coach/clients').message);
    } else if (role === 'coach') {
      console.log(assertCannotNavigate('/customer/home').message);
      console.log(assertCannotNavigate('/customer/programs').message);
    }
    console.groupEnd();
    
    console.groupEnd();
  };

  return { assertCanNavigate, assertCannotNavigate, runAccessTests };
};
