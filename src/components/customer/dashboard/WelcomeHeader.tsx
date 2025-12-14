// src/components/customer/dashboard/WelcomeHeader.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStreaksAndMotivation } from '@/hooks/useStreaksAndMotivation';
import { useTranslation } from 'react-i18next';

const WelcomeHeader = () => {
  const { profile, user } = useAuth();
  const { streakData, motivationMessage, loading } = useStreaksAndMotivation();
  const { t } = useTranslation();
  const displayName = (() => {
    if (profile?.full_name && profile.full_name.trim().length > 0) return profile.full_name;
    const email = user?.email || '';
    return email.includes('@') ? email.split('@')[0] : 'User';
  })();
  const timeOfDay = new Date().getHours() < 12 ? t('common.morning') : new Date().getHours() < 18 ? t('common.afternoon') : t('common.evening');

  if (loading) {
    return (
      <Card className="relative border-none bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="pr-36 sm:pr-40 space-y-3">
            <Skeleton className="h-8 w-3/4 bg-white/20" />
            <Skeleton className="h-4 w-full bg-white/20" />
          </div>
          <div className="absolute top-4 right-4">
            <Skeleton className="h-8 w-24 rounded-full bg-white/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative border-none bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg animate-fade-in-down overflow-hidden">
      <CardContent className="p-6">
        <div className="pr-36 sm:pr-40">
          <h1 className="text-2xl font-bold">{t('dashboard.goodMorning', { timeOfDay, coachName: displayName })} 👋</h1>
          <p className="opacity-80 mt-1 text-sm italic">"{motivationMessage}"</p>
        </div>
        
        {/* Streak Badge in top right corner */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <Flame size={16} className="text-white" />
          <span className="font-bold text-sm">{streakData.workoutStreak}</span>
          <span className="text-xs opacity-80">{t('dashboard.dayStreak')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;
