// src/pages/customer/ProgressPage.tsx
import { useState } from 'react';
import { useCustomerProgress } from '@/hooks/useCustomerProgress';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- NEW & UPDATED COMPONENT IMPORTS ---
import HeroProgressSnapshot from '@/components/customer/progress/HeroProgressSnapshot';
import DailyCheckinTrends from '@/components/customer/progress/DailyCheckinTrends';
import FitnessProgression from '@/components/customer/progress/fitness/FitnessProgression';
import MentalHealthProgression from '@/components/customer/progress/mental/MentalHealthProgression';
import PhotoProgressCard from '@/components/customer/progress/PhotoProgressCard';
import SmartInsights from '@/components/customer/progress/SmartInsights';
import FloatingActionButton from '@/components/customer/progress/FloatingActionButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Corrected import path for the NutritionProgression component
import NutritionProgression from '@/components/customer/progress/nutrition/NutritionProgression';
import WeightTrendCard from '@/components/customer/progress/WeightTrendCard';
import AIRecommendations from '@/components/customer/progress/AIRecommendations';
import { useAIPersonalization } from '@/hooks/useAIPersonalization';

export default function ProgressPage() {
  const { progressData: data, loading } = useCustomerProgress();
  const { planStatus } = usePaymentPlan();
  const { t } = useTranslation();
  const { personalization, loading: personalizationLoading } = useAIPersonalization();

  // State for the detail modal
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // --- EXAMPLE MODAL HANDLER ---
  const handleCardClick = (title: string, content: React.ReactNode) => {
    setModalData({ title, content });
  };

  // Check if user has payment plan access
  if (!planStatus.hasActivePlan) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t('progress.tracking')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('progress.unlockDescription')}
          </p>
          
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Upgrade to Track Progress</h3>
              </div>
              <p className="text-muted-foreground">
                Get access to detailed analytics, progress photos, workout streaks, and personalized insights.
              </p>
              <Button className="mt-2">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Defensive programming: ensure data exists
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Loading Progress...</h1>
          <p className="text-muted-foreground">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  // Check if user has minimum data requirements (1 week minimum)
  const hasMinimumData = data && (
    (data.dailyCheckins && data.dailyCheckins.length >= 7) ||
    (data.nutrition && data.nutrition.macros && data.nutrition.macros.length >= 7) ||
    (data.fitnessProgression && Object.values(data.fitnessProgression).some(progression => progression.length >= 7)) ||
    (data.mentalHealth && (data.mentalHealth as any).length >= 7)
  );

  const personalizationInsights = personalization?.insights?.map(insight => ({
    id: insight.id,
    text: insight.text,
    type: insight.type,
    emoji: insight.emoji || '💡',
  })) || [];

  const hasAIInsights = personalizationInsights.length > 0;
  const insightsToRender = hasAIInsights ? personalizationInsights : (data.smartInsights || []);
  const shouldShowInsights = hasAIInsights || (hasMinimumData && insightsToRender && insightsToRender.length > 0);

  // Check if user has any data at all (for basic display)
  const hasAnyData = data && (
    (data.dailyCheckins && data.dailyCheckins.length > 0) ||
    (data.nutrition && data.nutrition.macros && data.nutrition.macros.length > 0) ||
    (data.fitnessProgression && Object.values(data.fitnessProgression).some(progression => progression.length > 0)) ||
    (data.mentalHealth && (data.mentalHealth as any).length > 0)
  );

  if (!hasAnyData) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <div className="text-2xl">📊</div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('progress.yourProgress')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay consistent with your daily check-ins to track your progress and see your trends grow over time.
          </p>
          
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl">💪</div>
                <h3 className="text-xl font-semibold">Start Your Journey</h3>
              </div>
              <p className="text-muted-foreground">
                Complete your daily check-ins to begin tracking your wellness progress and see meaningful trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate averages for Hero card
  const last7DaysCheckins = data.dailyCheckins.slice(-7);
  const avgSleep = last7DaysCheckins.length > 0 
    ? last7DaysCheckins.reduce((sum, day) => sum + (day.sleep_hours || 0), 0) / last7DaysCheckins.length 
    : 0;
  const avgEnergy = last7DaysCheckins.length > 0
    ? last7DaysCheckins.reduce((sum, day) => sum + (day.energy || 0), 0) / last7DaysCheckins.length
    : 0;
  
  // --- NEW: Calculate averages for goal progression ---
  const last7DaysMacros = data.nutrition?.macros?.slice(-7) || [];
  const avgProtein = last7DaysMacros.length > 0
    ? last7DaysMacros.reduce((sum, day) => sum + day.protein, 0) / last7DaysMacros.length
    : 0;
  const avgCarbs = last7DaysMacros.length > 0
    ? last7DaysMacros.reduce((sum, day) => sum + day.carbs, 0) / last7DaysMacros.length
    : 0;

  return (
    <div className="relative w-full min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-28 space-y-10">
        {/* --- HEADER --- */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('progress.yourProgress')}</h1>
          <p className="text-muted-foreground">A detailed overview of your wellness journey.</p>
        </div>

        {/* 1. Hero Progress Snapshot - Only show if we have minimum data */}
        {hasMinimumData && (
          <HeroProgressSnapshot
            streak={data.workoutStreak}
            avgSleep={avgSleep}
            avgEnergy={avgEnergy}
            kcalBurned={data.kcalBurnedLast7Days}
            goals={data.userGoals}
            dailyCheckins={data.dailyCheckins}
            nutrition={data.nutrition}
            avgProtein={avgProtein}
            avgCarbs={avgCarbs}
          />
        )}

        {/* 2. Smart Insights */}
        {shouldShowInsights && insightsToRender && insightsToRender.length > 0 && (
          <SmartInsights insights={insightsToRender} />
        )}

        {personalization?.recommendations && personalization.recommendations.length > 0 && (
          <AIRecommendations recommendations={personalization.recommendations} loading={personalizationLoading} />
        )}

        {/* 3. Daily Check-in Trends - Show if we have any check-in data */}
        {data.dailyCheckins && data.dailyCheckins.length > 0 && (
          <DailyCheckinTrends checkins={data.dailyCheckins} onCardClick={handleCardClick} />
        )}
        
        {/* 4. Fitness Progression - Only show if we have minimum fitness data */}
        {data.fitnessProgression && Object.values(data.fitnessProgression).some(progression => progression.length >= 7) && (
          <FitnessProgression data={data.fitnessProgression} />
        )}

        {/* 5. Nutrition Progression - Only show if we have minimum nutrition data */}
        {data.nutrition && data.nutrition.macros && data.nutrition.macros.length >= 7 && (
          <NutritionProgression data={data.nutrition} />
        )}

        {/* 6. Mental Health Progression - Only show if we have minimum mental health data */}
        {data.mentalHealth && (data.mentalHealth as any).length >= 7 && (
          <MentalHealthProgression mentalHealth={data.mentalHealth} dailyCheckins={data.dailyCheckins}/>
        )}

        {/* 7. Weight and Photo Progress Cards - Always show, but with proper no-data messaging */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeightTrendCard />
          <PhotoProgressCard photos={data.photoEntries} />
        </div>

        {/* Show message if user has some data but not enough for full analysis */}
        {hasAnyData && !hasMinimumData && (
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl">📈</div>
                <h3 className="text-xl font-semibold">Building Your Progress Profile</h3>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                You're making great progress! Keep tracking your daily check-ins for at least a week to unlock detailed analytics, AI insights, and comprehensive progress tracking.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Continue for {7 - Math.min(data.dailyCheckins?.length || 0, 7)} more days to unlock full insights</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* --- FLOATING ACTION BUTTON --- */}
      <FloatingActionButton />

      {/* --- GENERIC DETAIL MODAL --- */}
      <Dialog open={!!modalData} onOpenChange={() => setModalData(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalData?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {modalData?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
