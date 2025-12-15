import { Navigate, useLocation } from 'react-router-dom';
import { useAccessLevel } from '@/contexts/AccessLevelContext';
import { Loader2, Crown, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessControlProps {
  children: ReactNode;
  requiredAccess?: 'payment' | 'coach' | 'free' | 'settings';
}

const LoadingScreen = () => (
  <div className="flex h-48 w-full items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

/**
 * Access Control Component
 * Uses unified AccessLevelContext for all access decisions
 */
const AccessControl = ({ children, requiredAccess = 'free' }: AccessControlProps) => {
  const { 
    isLoading, 
    isAuthenticated, 
    canAccessRoute,
    getAccessDenialReason,
  } = useAccessLevel();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleUpgrade = () => {
    navigate('/customer/payment/update-plan');
  };

  const handleFindCoach = () => {
    navigate('/customer/my-coach');
  };

  // Settings and free pages are always accessible
  if (requiredAccess === 'settings' || requiredAccess === 'free') {
    return <>{children}</>;
  }

  // Use unified access check
  const hasAccess = canAccessRoute(location.pathname);
  
  if (!hasAccess) {
    const denialReason = getAccessDenialReason(location.pathname);
    const isPaymentRequired = denialReason?.includes('subscription') || denialReason?.includes('trial');
    
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
                {isPaymentRequired 
                  ? <Crown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  : <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                }
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isPaymentRequired ? 'Unlock Premium Features' : 'Get Coach Access'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {denialReason || 'You do not have access to this page.'}
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
  }

  return <>{children}</>;
};

export default AccessControl;
