import { Link } from 'react-router-dom';
import { AlertCircle, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const CoachProfileBanner = () => {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('coachProfileBannerDismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('coachProfileBannerDismissed', 'true');
  };

  // Only show for coaches with incomplete profile
  if (!profile || profile.role !== 'coach') return null;
  if (profile.full_name) return null; // Profile is complete
  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800"
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 truncate">
              Complete your profile to unlock full functionality like sending offers and publishing content.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900"
            >
              <Link to="/coach/settings" className="flex items-center gap-1">
                Complete Profile
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoachProfileBanner;
