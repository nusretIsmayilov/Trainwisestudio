import { useState, useMemo } from 'react';
import { DailyCheckin, UserGoal } from '@/mockdata/progress/mockProgressData';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Flame, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// UPDATED: TimeRange type and values
type TimeRange = 7 | 14 | 30;
const timeRanges: TimeRange[] = [7, 14, 30];

const MiniStat = ({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) => (
  <div className="flex items-center gap-3">
    {icon}
    <div>
      <p className={cn("font-bold text-lg", color)}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-white/70">{label}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const isWeekly = label.includes('Week');
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50 shadow-lg">
        <p className="text-sm font-bold text-foreground">
          {`${payload[0].value?.toFixed(1)} ${payload[0].unit || ''}`}
          {isWeekly && <span className="font-normal text-muted-foreground"> (avg)</span>}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    );
  }
  return null;
};

export default function HeroProgressSnapshot({
  streak,
  goals,
  dailyCheckins,
  nutrition,
  kcalBurned,
  avgEnergy,
  avgSleep,
  avgProtein,
  avgCarbs,
}: {
  streak: number;
  goals: UserGoal[];
  dailyCheckins: DailyCheckin[];
  nutrition: { macros: { date: string; protein: number; carbs: number; fat: number }[] };
  kcalBurned: number;
  avgEnergy: number;
  avgSleep: number;
  avgProtein: number;
  avgCarbs: number;
}) {
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | undefined>(goals?.[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  const goalColors = {
    IMPROVE_SLEEP: 'from-purple-500 to-indigo-500',
    BUILD_MUSCLE: 'from-orange-500 to-red-500',
    IMPROVE_NUTRITION: 'from-emerald-500 to-green-500',
  };
  const goalStrokeColor = {
    IMPROVE_SLEEP: '#a855f7',
    BUILD_MUSCLE: '#f97316',
    IMPROVE_NUTRITION: '#10b981',
  };

  // UPDATED: Chart data logic now aggregates for 30-day view
  const chartData = useMemo(() => {
    if (!selectedGoal) return [] as Array<{ date: string; value: number }>;

    // Align keys with live data structure
    const dataKeyMap = { IMPROVE_SLEEP: 'sleep_hours', BUILD_MUSCLE: 'protein', IMPROVE_NUTRITION: 'protein' } as const;
    const dataKey = dataKeyMap[selectedGoal.type as keyof typeof dataKeyMap];

    const safeDaily = Array.isArray(dailyCheckins) ? dailyCheckins : [];
    const safeMacros = Array.isArray(nutrition?.macros) ? nutrition.macros : [];

    const sourceDataMap = { IMPROVE_SLEEP: safeDaily, BUILD_MUSCLE: safeMacros, IMPROVE_NUTRITION: safeMacros } as const;
    const sourceData = sourceDataMap[selectedGoal.type as keyof typeof sourceDataMap] || [];

    const slicedData = sourceData.slice(-timeRange);

    // Aggregate data into weekly averages for the 30-day view
    if (timeRange === 30) {
      const weeklyData = [];
      for (let i = 0; i < slicedData.length; i += 7) {
        const weekChunk = slicedData.slice(i, i + 7);
        if (weekChunk.length > 0) {
          const weekAvg = weekChunk.reduce((sum, day) => sum + Number(day[dataKey as keyof typeof day]), 0) / weekChunk.length;
          weeklyData.push({
            date: `Week ${Math.floor(i / 7) + 1}`,
            value: weekAvg,
          });
        }
      }
      return weeklyData;
    }

    // Return daily data for 7 and 14-day views
    return slicedData.map((d: any) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(d?.[dataKey] ?? 0),
    }));
  }, [selectedGoal, timeRange, dailyCheckins, nutrition?.macros]);

  const mainMetric = useMemo(() => {
    if (!chartData || chartData.length === 0) return { value: 'N/A', unit: '' };
    const avg = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;
    return { value: avg.toFixed(1), unit: selectedGoal?.targetUnit || '' };
  }, [chartData, selectedGoal]);

  if (!selectedGoal) return null;

  return (
    <motion.div
      layout
      className={cn(
        'w-full rounded-3xl p-4 sm:p-6 overflow-hidden flex flex-col transition-colors duration-500',
        'bg-white dark:bg-transparent',
        goalColors[selectedGoal.type as keyof typeof goalColors]
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- Goal Selection --- */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal)}
            className={cn('text-sm font-semibold px-3 py-1.5 rounded-full transition-all', selectedGoal?.id === goal.id ? 'bg-gray-900 text-white dark:bg-white/90 dark:text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30 dark:text-white')}
          >
            {goal.title}
          </button>
        ))}
      </div>

      {/* --- Main Metric & Chart --- */}
      <div className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={selectedGoal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-bold tracking-tighter text-gray-900 dark:text-white">{mainMetric.value}</span>
            <span className="text-xl font-medium text-gray-700 dark:text-white/80">{mainMetric.unit}</span>
          </motion.div>
        </AnimatePresence>
        <p className="text-sm text-muted-foreground">Average over last {timeRange} days</p>

        {/* --- Chart with horizontal scroll for mobile --- */}
        <div className="flex-grow w-full h-48 sm:h-56 mt-4 -mx-2 overflow-x-auto">
          {/* The inner div's minWidth enables scrolling for daily views */}
          <div className="h-full" style={{ minWidth: timeRange === 30 ? '100%' : '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`color${selectedGoal.type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={goalStrokeColor[selectedGoal.type as keyof typeof goalStrokeColor]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={goalStrokeColor[selectedGoal.type as keyof typeof goalStrokeColor]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="value" unit={selectedGoal.targetUnit} stroke={goalStrokeColor[selectedGoal.type as keyof typeof goalStrokeColor]} strokeWidth={3} fillOpacity={1} fill={`url(#color${selectedGoal.type})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Time Range & Mini Stats --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/20">
          {timeRanges.map(range => (
            <button key={range} onClick={() => setTimeRange(range)} className={cn('px-3 py-1 text-xs font-semibold rounded-full', timeRange === range ? 'bg-gray-900 text-white dark:bg-white/90 dark:text-black' : 'text-gray-600 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10')}>
              {range}D
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <MiniStat icon={<Flame className="h-6 w-6 text-orange-300" />} value={`${streak}`} label="Streak" color="text-orange-300" />
          <MiniStat icon={<Zap className="h-6 w-6 text-yellow-300" />} value={`${avgEnergy.toFixed(1)}/5`} label="Energy" color="text-yellow-300" />
          <MiniStat icon={<Activity className="h-6 w-6 text-rose-300" />} value={`${kcalBurned.toLocaleString()}`} label="Kcal" color="text-rose-300" />
        </div>
      </div>
    </motion.div>
  );
}
