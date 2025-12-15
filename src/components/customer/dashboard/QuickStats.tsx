// src/components/customer/dashboard/QuickStats.tsx
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, ArrowUp, ArrowDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { useWeightTracking } from "@/hooks/useWeightTracking";
import { useAccessLevel } from "@/contexts/AccessLevelContext";

const QuickStats = () => {
  const { profile } = useAuth();
  const { checkins } = useDailyCheckins();
  const {
    getWeightTrend,
    entries: weightEntries,
    addWeightEntry,
  } = useWeightTracking();
  const { accessLevel, hasCoach, hasPaymentPlan } = useAccessLevel();
  const [stats, setStats] = useState({
    avgWater: "0.0 L",
    avgEnergy: "N/A",
    avgSleep: "0.0 hrs",
    avgMood: "N/A",
    weightTrend: "0.0 kg",
    goalAdherence: 0,
    hasWeightData: false,
  });
  const [loading, setLoading] = useState(true);

  // 🔒 FIX: stabilize weight trend calculation
  const weightTrendValue = useMemo(() => {
    return getWeightTrend();
  }, [weightEntries]);

  // Test function to add sample weight data
  const addSampleWeightData = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await addWeightEntry(70.5, today.toISOString().split("T")[0]);
      await addWeightEntry(71.0, yesterday.toISOString().split("T")[0]);

      console.log("Sample weight data added");
    } catch (error) {
      console.error("Failed to add sample weight data:", error);
    }
  };

  const getUserPlanLevel = () => {
    if (!profile?.plan) return 0;

    const planMapping = {
      trial: 1,
      platform_monthly: 3,
      platform_yearly: 3,
      standard: 2,
      premium: 3,
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

      const last7Days = checkins.slice(-7);

      const waterDays = last7Days.filter(
        (c) => c.water_liters && c.water_liters > 0
      );
      const energyDays = last7Days.filter((c) => c.energy && c.energy > 0);
      const sleepDays = last7Days.filter(
        (c) => c.sleep_hours && c.sleep_hours > 0
      );
      const moodDays = last7Days.filter((c) => c.mood && c.mood > 0);

      const avgWater =
        waterDays.length > 0
          ? waterDays.reduce((sum, c) => sum + c.water_liters, 0) /
            waterDays.length
          : 0;
      const avgEnergy =
        energyDays.length > 0
          ? energyDays.reduce((sum, c) => sum + c.energy, 0) /
            energyDays.length
          : 0;
      const avgSleep =
        sleepDays.length > 0
          ? sleepDays.reduce((sum, c) => sum + c.sleep_hours, 0) /
            sleepDays.length
          : 0;
      const avgMood =
        moodDays.length > 0
          ? moodDays.reduce((sum, c) => sum + c.mood, 0) /
            moodDays.length
          : 0;

      const hasWeightData = weightEntries.length > 0;

      setStats({
        avgWater: `${avgWater.toFixed(1)} L`,
        avgEnergy: avgEnergy > 3.5 ? "Good" : avgEnergy > 2.5 ? "Fair" : "Low",
        avgSleep: `${avgSleep.toFixed(1)} hrs`,
        avgMood: avgMood > 3.5 ? "Positive" : avgMood > 2.5 ? "Neutral" : "Low",
        weightTrend: hasWeightData
          ? weightEntries.length === 1
            ? "Need more data"
            : `${weightTrendValue > 0 ? "+" : ""}${weightTrendValue.toFixed(
                1
              )} kg`
          : "No data",
        goalAdherence:
          last7Days.length > 0
            ? Math.round(
                (last7Days.filter(
                  (c) =>
                    c.water_liters && c.energy && c.sleep_hours && c.mood
                ).length /
                  last7Days.length) *
                  100
              )
            : 0,
        hasWeightData,
      });

      setLoading(false);
    };

    calculateStats();
  }, [checkins, weightEntries, weightTrendValue]);

  /* GERİ KALAN DOSYA AYNEN DEVAM EDİYOR — DOKUNULMADI */

  const statItems = [
    {
      label: "Avg. Water",
      value: stats.avgWater,
      emoji: "💧",
      requiredPlan: 1,
      color: "blue",
    },
    {
      label: "Avg. Energy",
      value: stats.avgEnergy,
      emoji: "⚡️",
      requiredPlan: 1,
      color: "green",
    },
    {
      label: "Avg. Sleep",
      value: stats.avgSleep,
      emoji: "😴",
      requiredPlan: 1,
      color: "indigo",
    },
    {
      label: "Avg. Mood",
      value: stats.avgMood,
      emoji: "😊",
      requiredPlan: 1,
      color: "rose",
    },
    ...(stats.hasWeightData
      ? [
          {
            label: "Weight Trend",
            value: stats.weightTrend,
            emoji: "⚖️",
            requiredPlan: 3,
            trend: "down",
            color: "sky",
          },
        ]
      : []),
    ...(stats.goalAdherence > 0
      ? [
          {
            label: "Goal Adherence",
            value: `${stats.goalAdherence}%`,
            emoji: "🎯",
            requiredPlan: 3,
            trend: "up",
            color: "purple",
          },
        ]
      : []),
  ];

  /* … (alt kısım aynen, hiç dokunulmadı) */
};

export default QuickStats;
