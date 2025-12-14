// src/pages/customer/CustomerDashboard.tsx
import WelcomeHeader from '@/components/customer/dashboard/WelcomeHeader';
import TodaysProgram from '@/components/customer/dashboard/TodaysFocus';
import QuickStats from '@/components/customer/dashboard/QuickStats';
import DailyCheckIn from '@/components/customer/dashboard/DailyCheckIn';
import CustomerStateBanner from '@/components/customer/dashboard/CustomerStateBanner';
import TrialCountdown from '@/components/customer/TrialCountdown';
import { useAccessLevel } from '@/contexts/AccessLevelContext';
import { useNavigate } from 'react-router-dom';
import LockedOverlay from '@/components/customer/dashboard/LockedOverlay';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const CustomerDashboard = () => {
  const { hasCoach, hasPaymentPlan } = useAccessLevel();
  const navigate = useNavigate();
  
  // Only show Today's Program if user has coach or payment plan
  const canAccessPrograms = hasCoach || hasPaymentPlan;
  const needsAccess = !hasCoach && !hasPaymentPlan;

  const handleUpgrade = () => {
    navigate('/customer/payment/update-plan');
  };

  const handleFindCoach = () => {
    navigate('/customer/my-coach');
  };

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* State Banner */}
      <motion.div variants={itemVariants}>
        <CustomerStateBanner />
      </motion.div>

      {/* Trial Countdown */}
      <motion.div variants={itemVariants}>
        <TrialCountdown />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <WelcomeHeader />
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="relative">
        <motion.div 
          className={cn("space-y-8", needsAccess && "blur-sm pointer-events-none select-none")}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <DailyCheckIn />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickStats />
          </motion.div>
          {canAccessPrograms && (
            <motion.div variants={itemVariants}>
              <TodaysProgram />
            </motion.div>
          )}
        </motion.div>
        {needsAccess && (
          <LockedOverlay
            title="Unlock your personalized dashboard"
            description="Start your free 7-day trial or subscribe to view everything inside your dashboard."
            benefits={[
              'Daily check-ins for mood, sleep, hydration, and energy',
              'Weekly insight cards with progress stats and goal tracking',
              'AI Coach programs tailored to your goals',
            ]}
            onUpgrade={handleUpgrade}
            onFindCoach={handleFindCoach}
          />
        )}
      </div>
    </motion.div>
  );
};

export default CustomerDashboard;
