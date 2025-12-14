import { Navigate, useLocation } from 'react-router-dom';
import { useAccessLevel } from '@/contexts/AccessLevelContext';
import { Crown, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DashboardSkeleton,
  ProgramsSkeleton,
  LibrarySkeleton,
  ProgressSkeleton,
  MessagesSkeleton,
  SettingsSkeleton,
  GenericPageSkeleton,
} from './PageSkeletons';

interface CustomerRouteGuardProps {
  children: ReactNode;
  skeletonType?: 'dashboard' | 'programs' | 'library' | 'progress' | 'messages' | 'settings' | 'generic';
}

const getSkeletonComponent = (type?: string) => {
  switch (type) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'programs':
      return <ProgramsSkeleton />;
    case 'library':
      return <LibrarySkeleton />;
    case 'progress':
      return <ProgressSkeleton />;
    case 'messages':
      return <MessagesSkeleton />;
    case 'settings':
      return <SettingsSkeleton />;
    default:
      return <GenericPageSkeleton />;
  }
};

const AccessDeniedOverlay = ({ 
  reason, 
  children 
}: { 
  reason: string; 
  children: ReactNode;
}) => {
  const navigate = useNavigate();
  
  const handleUpgrade = () => navigate('/customer/payment/update-plan');
  const handleFindCoach = () => navigate('/customer/my-coach');

  // Determine overlay type based on denial reason
  const isPaymentRequired = reason.includes('subscription') || reason.includes('trial');
  const Icon = isPaymentRequired ? Crown : Users;

  return (
    <div className="relative isolate min-h-[60vh]">
      <div className="blur-sm pointer-events-none select-none min-h-[60vh]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-4 py-10 bg-background/95 backdrop-blur-xl z-20">
        <div className={`text-center p-6 max-w-md mx-auto rounded-2xl border ${
          isPaymentRequired 
            ? 'border-orange-200/70 dark:border-orange-900/50' 
            : 'border-blue-200/70 dark:border-blue-900/50'
        } bg-card shadow-2xl`}>
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isPaymentRequired 
                ? 'bg-orange-100 dark:bg-orange-900/30' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <Icon className={`w-8 h-8 ${
                isPaymentRequired 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isPaymentRequired ? 'Unlock Premium Features' : 'Get Coach Access'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reason}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={handleUpgrade}
              className={isPaymentRequired 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe Now
            </Button>
            <Button 
              onClick={handleFindCoach}
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Find a Coach
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Customer Route Guard
 * Uses unified AccessLevelContext for all access decisions
 */
const CustomerRouteGuard = ({ children, skeletonType }: CustomerRouteGuardProps) => {
  const { 
    isLoading, 
    isAuthenticated, 
    isOnboardingComplete,
    canAccessRoute,
    getAccessDenialReason
  } = useAccessLevel();
  const location = useLocation();

  // Loading state
  if (isLoading) return getSkeletonComponent(skeletonType);
  
  // Auth checks
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboardingComplete) return <Navigate to="/onboarding/step-1" replace />;

  // Access check using unified context
  const hasAccess = canAccessRoute(location.pathname);
  
  if (!hasAccess) {
    const denialReason = getAccessDenialReason(location.pathname) || 'You do not have access to this page.';
    return (
      <AccessDeniedOverlay reason={denialReason}>
        {children}
      </AccessDeniedOverlay>
    );
  }

  return <>{children}</>;
};

export default CustomerRouteGuard;
