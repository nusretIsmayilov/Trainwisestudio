import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, AlertCircle, MessageCircle } from "lucide-react";
import FitnessTrendChart from "./charts/FitnessTrendChart";
import MentalHealthTrendChart from "./charts/MentalHealthTrendChart";
import { useRealTimeClientData } from '@/hooks/useRealTimeClientData';
import { useClientStatus } from '@/hooks/useClientStatus';
import AwaitingOfferMessage from './AwaitingOfferMessage';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface DashboardProps {
  client: any;
}

// --- Utilities ---
const Trend = React.memo(({ value }: { value: number }) => {
  if (value > 0)
    return (
      <span className="text-green-500 flex items-center text-xs font-medium">
        <ArrowUpRight className="w-3 h-3" />
        {value.toFixed(1)}%
      </span>
    );
  if (value < 0)
    return (
      <span className="text-red-500 flex items-center text-xs font-medium">
        <ArrowDownRight className="w-3 h-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  return <span className="text-muted-foreground text-xs">0%</span>;
});
Trend.displayName = "Trend";

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground p-2 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-xs mb-1">{label}</p>
        {payload.map((p: any) => (
          <p
            key={p.name}
            className="text-xs flex items-center"
            style={{ color: p.color }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: p.color }}
            ></span>
            {`${p.name}: `} <span className="font-medium ml-1">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = "CustomTooltip";

// Radial Progress Card
const RadialProgressCard = React.memo(
  ({
    title,
    value,
    maxValue = 100,
    unit = "",
    color,
    emoji,
    subText,
    size = 120,
  }: {
    title: string;
    value: number;
    maxValue?: number;
    unit?: string;
    color: string;
    emoji?: string;
    subText?: string;
    size?: number;
  }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);

    return (
      <Card className="rounded-2xl shadow-lg bg-card border-none p-4 flex flex-col items-center justify-center min-h-[200px]">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              data={[{ value: percentage }]}
            >
              <RadialBar dataKey="value" cornerRadius={10} fill={color} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl">{emoji}</div>
            <div className="text-lg font-bold text-foreground">
              {value}
              {unit}
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {subText && (
            <p className="text-xs text-muted-foreground mt-1">{subText}</p>
          )}
        </div>
      </Card>
    );
  }
);
RadialProgressCard.displayName = "RadialProgressCard";

// Daily Trend Card
const DailyTrendCard = React.memo(
  ({
    title,
    data,
    dataKey,
    color,
    emoji,
    unit = "",
    selectedRange,
  }: {
    title: string;
    data: any[];
    dataKey: string;
    color: string;
    emoji?: string;
    unit?: string;
    selectedRange: string;
  }) => {
    const rangeInDays = useMemo(() => {
      return selectedRange === "4w"
        ? 28
        : selectedRange === "12w"
        ? 84
        : 168;
    }, [selectedRange]);

    const filteredData = useMemo(
      () => data.slice(-rangeInDays),
      [data, rangeInDays]
    );

    const { currentValue, previousValue, trend } = useMemo(() => {
      const currentValue = filteredData[filteredData.length - 1]?.[dataKey] || 0;
      const previousValue =
        filteredData[filteredData.length - 8]?.[dataKey] || currentValue;
      const trend =
        previousValue !== 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0;
      return { currentValue, previousValue, trend };
    }, [filteredData, dataKey]);

    return (
      <Card className="rounded-2xl shadow-lg bg-card border-none p-4 min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {emoji && <span className="text-lg">{emoji}</span>}
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          </div>
          <Trend value={trend} />
        </div>
        <div className="mb-3">
          <span className="text-2xl font-bold text-foreground">
            {currentValue.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData.slice(-14)}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }
);
DailyTrendCard.displayName = "DailyTrendCard";

// Main dashboard component
const ProgressProgramsTab: React.FC<DashboardProps> = ({ client }) => {
  const [selectedRange, setSelectedRange] = useState("4w");
  const [weightRange, setWeightRange] = useState("1m");
  const { clientData, loading } = useRealTimeClientData(client?.id);
  const { clientStatus } = useClientStatus(client?.id);
  const { t } = useTranslation();

  // Dummy Data Memoized (fallback) - MUST be called before any early returns
  const dummyDailyCheckIns = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 180; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      data.push({
        date: d.toISOString().split("T")[0],
        water: Math.floor(Math.random() * 6) + 1,
        sleep: parseFloat((Math.random() * (9 - 6) + 6).toFixed(1)),
        mood: Math.floor(Math.random() * 10) + 1,
        energy: Math.floor(Math.random() * 10) + 1,
        stress: Math.floor(Math.random() * 10) + 1,
        anxiety: Math.floor(Math.random() * 10) + 1,
      });
    }
    return data.reverse();
  }, []);

  const dummyNutrition = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          protein: isWeekend ? 100 + Math.random() * 40 : 110 + Math.random() * 30,
          carbs: isWeekend ? 250 + Math.random() * 60 : 270 + Math.random() * 40,
          fat: isWeekend ? 60 + Math.random() * 20 : 65 + Math.random() * 15,
          calories: isWeekend ? 2100 + Math.random() * 400 : 2000 + Math.random() * 300,
        };
      }).reverse(),
    []
  );

  const dummyWeightTrend = useMemo(
    () =>
      Array.from({ length: 365 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split("T")[0],
          weight: 180 - i * 0.03 + (Math.random() * 1.5 - 0.75),
        };
      }).reverse(),
    []
  );

  // Use real data from clientData - handle null case
  const dailyData = useMemo(() => {
    if (!clientData) return dummyDailyCheckIns;
    // Use real daily check-in data if available, otherwise fallback to dummy data
    if (clientData.dailyCheckin.today.mood > 0 || clientData.dailyCheckin.today.energy > 0) {
      // Transform real data to match chart format - use today's data as the big number
      return [{
        date: new Date().toISOString().split("T")[0],
        water: 0, // Not tracked in daily check-ins
        sleep: clientData.dailyCheckin.today.sleep,
        mood: clientData.dailyCheckin.today.mood,
        energy: clientData.dailyCheckin.today.energy,
        stress: clientData.dailyCheckin.today.stress,
        anxiety: 0, // Not tracked separately
      }];
    }
    return dummyDailyCheckIns;
  }, [clientData, dummyDailyCheckIns]);

  const nutritionData = useMemo(() => {
    if (!clientData) return dummyNutrition;
    // Use real nutrition data if available
    if (clientData.programTrends.nutrition.hasData) {
      return clientData.programTrends.nutrition.data.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fat: entry.fat || 0,
        calories: entry.calories || 0,
      }));
    }
    return dummyNutrition;
  }, [clientData, dummyNutrition]);

  const aggregateWeightData = useMemo(() => {
    if (!clientData) return [];
    const rawData = clientData.weightJourney.hasData ? clientData.weightJourney.entries : dummyWeightTrend;
    const now = new Date();
    const rangeInDays =
      weightRange === "1m"
        ? 30
        : weightRange === "3m"
        ? 90
        : weightRange === "6m"
        ? 180
        : 365;

    const filteredData = rawData.filter((d) => {
      const date = new Date(d.date);
      const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
      return diffInDays <= rangeInDays && diffInDays >= 0;
    });

    const aggregateData = (data, periods, labelFormat) => {
      const result = [];
      for (let i = 0; i < periods; i++) {
        const startIdx = i * Math.floor(data.length / periods);
        const endIdx = (i + 1) * Math.floor(data.length / periods);
        const chunk = data.slice(startIdx, endIdx);
        if (chunk.length > 0) {
          const avgWeight =
            chunk.reduce((sum, item) => sum + item.weight, 0) / chunk.length;
          const startDate = new Date(chunk[0].date);
          const endDate = new Date(chunk[chunk.length - 1].date);

          let label;
          switch (labelFormat) {
            case "week":
              label = `W${i + 1}`;
              break;
            case "biweek":
            case "triweek":
              label = `${startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}-${endDate.toLocaleDateString("en-US", { day: "numeric" })}`;
              break;
            case "month":
              label = startDate.toLocaleDateString("en-US", { month: "short" });
              break;
            default:
              label = `Period ${i + 1}`;
          }

          result.push({
            date: chunk[Math.floor(chunk.length / 2)].date,
            weight: parseFloat(avgWeight.toFixed(1)),
            label,
            periodStart: startDate,
            periodEnd: endDate,
            periodType: labelFormat,
          });
        }
      }
      return result;
    };

    switch (weightRange) {
      case "1m":
        return aggregateData(filteredData, 4, "week");
      case "3m":
        return aggregateData(filteredData, 6, "biweek");
      case "6m":
        return aggregateData(filteredData, 8, "triweek");
      case "12m":
        return aggregateData(filteredData, 12, "month");
      default:
        return aggregateData(filteredData, 4, "week");
    }
  }, [clientData, dummyWeightTrend, weightRange]);

  const colors = useMemo(
    () => ({
      water: "#60A5FA",
      sleep: "#A78BFA",
      mood: "#FCD34D",
      energy: "#F87171",
      fitness: "#60A5FA",
      nutritionProtein: "#34D399",
      nutritionCarbs: "#818CF8",
      nutritionFat: "#FBBF24",
      nutritionCalories: "#EF4444",
      mentalStress: "#FB923C",
      mentalAnxiety: "#F87171",
      mentalMeditation: "#4ADE80",
      mentalYoga: "#60A5FA",
      weight: "#A78BFA",
      heartRate: "#FF6B6B",
      steps: "#818CF8",
      exercise: "#50E3C2",
      caloriesBurned: "#FCD34D",
    }),
    []
  );

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('common.loading')} {t('progress.title').toLowerCase()}...
      </div>
    );
  }

  // Check if client is waiting for an offer
  if (clientStatus?.status === 'waiting_offer') {
    return (
      <AwaitingOfferMessage 
        clientName={client?.full_name || client?.name || 'this client'} 
        onSendOffer={() => {
          // TODO: Implement send offer functionality
          console.log('Send offer clicked');
        }}
      />
    );
  }

  if (!clientData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('common.noDataAvailable')}
      </div>
    );
  }

  // No data message component
  const NoDataMessage = ({ programType, hasProgram }: { programType: string; hasProgram: boolean }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {hasProgram 
          ? `The user hasn't filled in their ${programType} program. It might be a good idea to check in with them.`
          : `The user doesn't have a ${programType} program assigned.`
        }
      </p>
      <Button variant="outline" size="sm" className="gap-2">
        <MessageCircle className="h-4 w-4" />
        Check in with client
      </Button>
    </div>
  );

  return (
    <>
      {/* Range Selector */}
      <div className="flex justify-center sm:justify-end mb-4 sm:mb-6">
        <div className="bg-card/80 backdrop-blur-md rounded-full border border-border p-1 flex shadow-sm">
          {["4w", "12w", "24w"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`text-xs sm:text-sm font-medium px-2 sm:px-3 lg:px-4 py-1 rounded-full transition-all duration-300 ${
                selectedRange === range
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {range === "4w" ? "4 Weeks" : range === "12w" ? "12 Weeks" : "24 Weeks"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {/* Daily Trend Cards */}
        <DailyTrendCard
          title="Water Intake"
          data={dailyData}
          dataKey="water"
          color={colors.water}
          emoji="💧"
          unit="L"
          selectedRange={selectedRange}
        />
        <DailyTrendCard
          title="Energy"
          data={dailyData}
          dataKey="energy"
          color={colors.energy}
          emoji="⚡"
          selectedRange={selectedRange}
        />
        <DailyTrendCard
          title="Mood"
          data={dailyData}
          dataKey="mood"
          color={colors.mood}
          emoji="😊"
          selectedRange={selectedRange}
        />
        <DailyTrendCard
          title="Stress"
          data={dailyData}
          dataKey="stress"
          color={colors.mentalStress}
          emoji="🧠"
          selectedRange={selectedRange}
        />
        <DailyTrendCard
          title="Sleep"
          data={dailyData}
          dataKey="sleep"
          color={colors.sleep}
          emoji="😴"
          unit="hrs"
          selectedRange={selectedRange}
        />
        <DailyTrendCard
          title="Anxiety"
          data={dailyData}
          dataKey="anxiety"
          color={colors.mentalAnxiety}
          emoji="😰"
          selectedRange={selectedRange}
        />
      </div>

      {/* Nutrition Overview Card */}
      <div className="mt-6">
        <Card className="rounded-2xl shadow-lg bg-card border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Nutrition Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutritionData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg border border-border">
                          <p className="font-semibold text-sm mb-2">{label}</p>
                          {payload.map((p: any, idx: number) => (
                            <p key={idx} className="text-sm" style={{ color: p.color }}>
                              {`${p.name}: ${p.value}g`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="protein" fill={colors.nutritionProtein} name="Protein" />
                <Bar dataKey="carbs" fill={colors.nutritionCarbs} name="Carbs" />
                <Bar dataKey="fat" fill={colors.nutritionFat} name="Fat" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weight Journey Card - Only show if user has payment plan */}
      {clientData.membership.hasPaymentPlan && (
        <div className="mt-6">
          <Card className="rounded-2xl shadow-lg bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Weight Journey</h3>
              <div className="bg-card/80 backdrop-blur-md rounded-full border border-border p-1 flex shadow-sm">
                {["1m", "3m", "6m", "12m"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setWeightRange(range)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                      weightRange === range
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {range === "1m"
                      ? "1M"
                      : range === "3m"
                      ? "3M"
                      : range === "6m"
                      ? "6M"
                      : "1Y"}
                  </button>
                ))}
              </div>
            </div>
            {clientData.weightJourney.hasData ? (
              <>
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    {aggregateWeightData.length > 0
                      ? aggregateWeightData[aggregateWeightData.length - 1].weight
                      : "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">lbs</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aggregateWeightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card text-card-foreground p-3 rounded-lg shadow-lg border border-border">
                                <p className="font-semibold text-sm mb-1">{label}</p>
                                <p className="text-sm" style={{ color: payload[0].color }}>
                                  Weight: {payload[0].value} lbs
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={colors.weight}
                        strokeWidth={3}
                        dot={{ fill: colors.weight, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: colors.weight, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <NoDataMessage programType="weight tracking" hasProgram={true} />
            )}
          </Card>
        </div>
      )}

      {/* Fitness and Mental Health Trend Charts - Only show if user has corresponding programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Fitness Trend Chart */}
        {clientData.programTrends.fitness.hasProgram ? (
          clientData.programTrends.fitness.hasData ? (
            <FitnessTrendChart 
              data={clientData.programTrends.fitness.data} 
              selectedRange={selectedRange}
            />
          ) : (
            <Card className="rounded-2xl shadow-lg bg-card border border-border p-6">
              <NoDataMessage programType="fitness" hasProgram={true} />
            </Card>
          )
        ) : null}

        {/* Mental Health Trend Chart */}
        {clientData.programTrends.mentalHealth.hasProgram ? (
          clientData.programTrends.mentalHealth.hasData ? (
            <MentalHealthTrendChart 
              data={clientData.programTrends.mentalHealth.data} 
              selectedRange={selectedRange}
            />
          ) : (
            <Card className="rounded-2xl shadow-lg bg-card border border-border p-6">
              <NoDataMessage programType="mental health" hasProgram={true} />
            </Card>
          )
        ) : null}
      </div>
    </>
  );
};

export default ProgressProgramsTab;
