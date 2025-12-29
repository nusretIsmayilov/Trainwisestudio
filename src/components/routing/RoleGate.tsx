// src/components/routing/RoleGate.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import PaymentPlanModal from '@/components/modals/PaymentPlanModal';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { useNavigate } from 'react-router-dom';

interface RoleGateProps {
  allowedRole: 'coach' | 'customer';
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-emerald-50">
    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
  </div>
);

const RoleGate = ({ allowedRole, children }: RoleGateProps) => {
  const { profile, loading } = useAuth();
  const { planStatus, startTrial } = usePaymentPlan();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  // During password recovery, never redirect into dashboards; force staying on update-password
  try {
    if (sessionStorage.getItem('recoveryFlow') === '1') {
      return <Navigate to="/update-password" replace />;
    }
  } catch {}

  // Check if modal was dismissed in this session
  useEffect(() => {
    if (
      allowedRole === 'customer' &&
      profile?.onboarding_complete &&
      planStatus.needsUpgrade &&
      !planStatus.hasActiveTrial
    ) {
      const modalDismissed = sessionStorage.getItem('paymentModalDismissed');
      const modalShown = sessionStorage.getItem('paymentModalShown');
      
      if (!modalDismissed && !modalShown) {
        const timer = setTimeout(() => {
          setShowPaymentModal(true);
          sessionStorage.setItem('paymentModalShown', 'true');
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [allowedRole, profile?.onboarding_complete, planStatus.needsUpgrade]);

  if (loading || planStatus.loading) return <LoadingScreen />;
  
  if (!profile) return <Navigate to="/login" replace />;

  // If role doesn't match, redirect to the correct dashboard for their actual role
  if (profile.role !== allowedRole) {
    if (profile.role === 'coach') {
      return <Navigate to="/coach/dashboard" replace />;
    }
    if (profile.role === 'customer') {
      return profile.onboarding_complete 
        ? <Navigate to="/customer/dashboard" replace />
        : <Navigate to="/onboarding/step-0" replace />;
    }
  }

  // For customer role, check onboarding completion
  if (allowedRole === 'customer' && !profile.onboarding_complete) {
    return <Navigate to="/onboarding/step-1" replace />;
  }

  // Coach profile completion is handled by a non-blocking banner in AppShell
  // Navigation should NEVER be blocked for coaches

  const handleStartTrial = async () => {
    const { error } = await startTrial();
    if (!error) {
      setShowPaymentModal(false);
      sessionStorage.setItem('paymentModalDismissed', 'true');
    }
  };

  const handleUpgrade = () => {
    setShowPaymentModal(false);
    sessionStorage.setItem('paymentModalDismissed', 'true');
    navigate('/customer/payment/update-plan');
  };

  const handleClose = () => {
    setShowPaymentModal(false);
    sessionStorage.setItem('paymentModalDismissed', 'true');
  };

  return (
    <>
      {children}
      <PaymentPlanModal
        isOpen={showPaymentModal}
        onClose={handleClose}
        hasUsedTrial={planStatus.hasUsedTrial}
        onStartTrial={!planStatus.hasUsedTrial ? handleStartTrial : undefined}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default RoleGate;