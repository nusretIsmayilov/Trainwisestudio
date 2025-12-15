import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dumbbell, Trophy } from 'lucide-react';

// Brzycki formula for estimating 1-Rep Max
const calculateE1RM = (weight: number, reps: number) => {
  if (reps < 1) return 0;
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
};

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const dateLabel = new Date(label).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="bg-gray-800/95 dark:bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-600/50 dark:border-gray-300/50 shadow-lg min-w-[150px] text-white dark:text-gray-900">
        <p className="text-sm font-bold">{dateLabel}</p>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-400 dark:text-gray-600">e-1RM:</span>
          <span className="font-semibold text-orange-400 dark:text-orange-600">
            {payload[0].value?.toFixed(0)} kg
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function FitnessProgression({
  data,
}: {
  data: any; // Changed from ProgressData['fitnessProgression'] to any for flexibility
}) {
  // Handle case where data is empty or undefined
  if (!data || !data.exercises || data.exercises.length === 0) {
    return (
      <div className="w-full flex flex-col gap-8 text-gray-900 dark:text-white">
        <div className="bg-white dark:bg-[#1f2937] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-lg dark:shadow-none">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Fitness Progress
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No fitness data available yet. Start logging your workouts to see your progress here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [selectedExercise, setSelectedExercise] = useState(data.exercises[0]);

  const exerciseData = useMemo(() => {
    const history = selectedExercise.history || [];
    if (history.length === 0) {
      return { chartData: [], highest: 0, lowest: 0, currentE1RM: 0, domain: [0, 0] };
    }

    const chartData = history.map((session) => {
      const ts = new Date(session.date).getTime(); // timestamp for numeric X-axis
      return {
        timestamp: ts,
        e1RM: calculateE1RM(session.weight, session.reps),
      };
    });

    const timestamps = chartData.map((d) => d.timestamp);
    const e1RMs = chartData.map((d) => d.e1RM);

    const highest = Math.max(...e1RMs);
    const lowest = Math.min(...e1RMs);
    const currentE1RM = e1RMs[e1RMs.length - 1] || 0;

    // Add small padding to center line
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const padding = (maxTs - minTs) * 0.1; // 10% padding on both sides

    return { chartData, highest, lowest, currentE1RM, domain: [minTs - padding, maxTs + padding] };
  }, [selectedExercise]);

  return (
    <motion.div
      className="w-full flex flex-col gap-8 text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-[#1f2937] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-lg dark:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Fitness Progress
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your strength trend for {selectedExercise.exerciseName}
              </p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedExercise.exerciseName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 text-center mt-4 md:mt-0"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {data.consistency}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Consistency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {selectedExercise.personalRecord.value.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Personal Record ({selectedExercise.personalRecord.unit})
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {exerciseData.currentE1RM.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current e-1RM (kg)
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 flex-wrap">
            {data.exercises.map((ex) => (
              <button
                key={ex.exerciseName}
                onClick={() => setSelectedExercise(ex)}
                className={cn(
                  'text-sm font-semibold px-3 py-1.5 rounded-full transition-all',
                  selectedExercise.exerciseName === ex.exerciseName
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {ex.exerciseName}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Strength Trend
            </h3>
            <div className="h-60 w-full overflow-hidden -mx-6 sm:-mx-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={exerciseData.chartData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={exerciseData.domain} // centered domain
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    allowDuplicatedCategory={false}
                    interval="preserveEnd"
                    tickFormatter={(ts) =>
                      new Date(ts).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(100,100,100,0.2)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="e1RM"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorFitness)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              <p>
                Highest e-1RM:{' '}
                <span className="font-bold">{exerciseData.highest.toFixed(0)} kg</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <p>
                Lowest e-1RM:{' '}
                <span className="font-bold">{exerciseData.lowest.toFixed(0)} kg</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
