// src/components/customer/dashboard/QuickStats.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyCheckins } from '@/hooks/useDailyCheckins';
import { useWeightTracking } from '@/hooks/useWeightTracking';
import { useAccessLevel } from '@/contexts/AccessLevelContext';

const QuickStats = () => {
  const { profile } = useAuth();
  const { checkins } = useDailyCheckins();
  const { getWeightTrend, entries: weightEntries, addWeightEntry } = useWeightTracking();
  const { accessLevel, hasCoach, hasPaymentPlan } = useAccessLevel();
  const [stats, setStats] = useState({
    avgWater: '0.0 L',
    avgEnergy: 'N/A',
    avgSleep: '0.0 hrs',
    avgMood: 'N/A',
    weightTrend: '0.0 kg',
    goalAdherence: 0,
    hasWeightData: false,
  });
  const [loading, setLoading] = useState(true);

  // Test function to add sample weight data
  const addSampleWeightData = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Add weight entries for testing
      await addWeightEntry(70.5, today.toISOString().split('T')[0]);
      await addWeightEntry(71.0, yesterday.toISOString().split('T')[0]);
      
      console.log('Sample weight data added');
    } catch (error) {
      console.error('Failed to add sample weight data:', error);
    }
  };

  // Determine user plan level based on profile plan and payment status
  const getUserPlanLevel = () => {
    if (!profile?.plan) return 0;
    
    // Map database plan values to plan levels
    const planMapping = {
      'trial': 1,
      'platform_monthly': 3,  // This should be premium level
      'platform_yearly': 3,   // This should be premium level
      'standard': 2,
      'premium': 3
    };
    
    return planMapping[profile.plan] || 0;
  };
  
  const userPlanLevel = getUserPlanLevel();


  useEffect(() => {
    const calculateStats = () => {
      if (!checkins || checkins.length === 0) {
        setLoading(false);
        return;
      }

      // Get last 7 days of data
      const last7Days = checkins.slice(-7);
      
      // Calculate averages from real data - only include days with actual data
      const waterDays = last7Days.filter(c => c.water_liters && c.water_liters > 0);
      const energyDays = last7Days.filter(c => c.energy && c.energy > 0);
      const sleepDays = last7Days.filter(c => c.sleep_hours && c.sleep_hours > 0);
      const moodDays = last7Days.filter(c => c.mood && c.mood > 0);
      
      const avgWater = waterDays.length > 0 ? waterDays.reduce((sum, c) => sum + c.water_liters, 0) / waterDays.length : 0;
      const avgEnergy = energyDays.length > 0 ? energyDays.reduce((sum, c) => sum + c.energy, 0) / energyDays.length : 0;
      const avgSleep = sleepDays.length > 0 ? sleepDays.reduce((sum, c) => sum + c.sleep_hours, 0) / sleepDays.length : 0;
      const avgMood = moodDays.length > 0 ? moodDays.reduce((sum, c) => sum + c.mood, 0) / moodDays.length : 0;

      // Calculate weight trend from real data
      const weightTrend = getWeightTrend();

      // Calculate goal adherence based on completed check-ins
      const completedDays = last7Days.filter(c => c.water_liters && c.energy && c.sleep_hours && c.mood).length;
      const goalAdherence = last7Days.length > 0 ? Math.round((completedDays / last7Days.length) * 100) : 0;

      // Check if user has weight data
      const hasWeightData = weightEntries.length > 0;

      setStats({
        avgWater: `${avgWater.toFixed(1)} L`,
        avgEnergy: avgEnergy > 3.5 ? 'Good' : avgEnergy > 2.5 ? 'Fair' : 'Low',
        avgSleep: `${avgSleep.toFixed(1)} hrs`,
        avgMood: avgMood > 3.5 ? 'Positive' : avgMood > 2.5 ? 'Neutral' : 'Low',
        weightTrend: hasWeightData ? (weightEntries.length === 1 ? 'Need more data' : `${weightTrend > 0 ? '+' : ''}${weightTrend.toFixed(1)} kg`) : 'No data',
        goalAdherence,
        hasWeightData, // Add flag to track if weight data exists
      });
      setLoading(false);
    };

    calculateStats();
  }, [checkins, weightEntries]);

  const statItems = [
    { label: "Avg. Water", value: stats.avgWater, emoji: '💧', requiredPlan: 1, color: 'blue' },
    { label: "Avg. Energy", value: stats.avgEnergy, emoji: '⚡️', requiredPlan: 1, color: 'green' },
    { label: "Avg. Sleep", value: stats.avgSleep, emoji: '😴', requiredPlan: 1, color: 'indigo' },
    { label: "Avg. Mood", value: stats.avgMood, emoji: '😊', requiredPlan: 1, color: 'rose' },
    ...(stats.hasWeightData ? [{ label: "Weight Trend", value: stats.weightTrend, emoji: '⚖️', requiredPlan: 3, trend: 'down', color: 'sky' }] : []),
    ...(stats.goalAdherence > 0 ? [{ label: "Goal Adherence", value: `${stats.goalAdherence}%`, emoji: '🎯', requiredPlan: 3, trend: 'up', color: 'purple' }] : []),
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Your Weekly Stats</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="min-w-[160px] flex-1 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasPartialAccess = hasCoach && !hasPaymentPlan;

  return (
    <div className="relative">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Your Weekly Stats</h2>
      </div>
      
      <div className="p-1 -m-1">
        <div className={cn(
          "flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}>
          {statItems.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              isLocked={stat.requiredPlan > userPlanLevel}
            />
          ))}
        </div>
        
        {hasPartialAccess && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Coach Access</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              You have limited access through your coach. Subscribe for full statistics and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Updated themes to be fully responsive for both light and dark modes
const statCardThemes = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700/80 dark:text-blue-200',
    green: 'from-emerald-50 to-green-100 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700/80 dark:text-emerald-200',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700/80 dark:text-indigo-200',
    rose: 'from-rose-50 to-rose-100 border-rose-200 text-rose-900 dark:bg-rose-900/30 dark:border-rose-700/80 dark:text-rose-200',
    sky: 'from-sky-50 to-sky-100 border-sky-200 text-sky-900 dark:bg-sky-900/30 dark:border-sky-700/80 dark:text-sky-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900 dark:bg-purple-900/30 dark:border-purple-700/80 dark:text-purple-200',
};

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  isLocked: boolean;
  trend?: string;
  color: string;
  hasPartialAccess?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, label, value, isLocked, trend, color }) => {
  const theme = statCardThemes[color];

  // Show locked state with grayscale but no individual upgrade button
  if (isLocked) {
    return (
      <Card className="min-w-[160px] flex-1 shadow-sm bg-card border opacity-50">
        <CardContent className="p-4 flex flex-col justify-center items-center h-full text-center gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-lg filter grayscale">{emoji}</span>
            <p className="text-xs font-semibold">{label}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Lock size={12} />
            <span>Locked</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("min-w-[160px] flex-1 shadow-sm hover:shadow-lg transition-all duration-300 border bg-gradient-to-br dark:bg-none", theme)}>
        <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{emoji}</span>
                <p className="text-xs font-semibold">{label}</p>
            </div>
            
            <div className="flex items-baseline gap-1.5 mt-2">
                <p className="text-2xl font-bold dark:text-white">{value}</p>
                {trend && (
                    <div className={cn("flex items-center font-bold text-xs", trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                        {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
};

export default QuickStats;
