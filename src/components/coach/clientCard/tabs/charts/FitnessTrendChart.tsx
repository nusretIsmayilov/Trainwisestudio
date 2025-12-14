import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FitnessTrendChartProps {
  data: any[];
  selectedRange: string;
}

const EnhancedFitnessTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-white/90 p-4 rounded-xl shadow-xl backdrop-blur-md border border-gray-200/50 text-gray-800 max-w-xs">
        <div className="border-b border-gray-200/50 pb-2 mb-3">
          <p className="font-bold text-sm text-gray-900">{label}</p>
          <p className="text-xs text-gray-600">{data.fullDate}</p>
        </div>
        
        {/* Weekly Summary */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Weekly Progress:</span>
            <span className={`text-xs font-bold ${data.adherence === 100 ? 'text-green-600' : data.adherence >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {data.adherence === 100 ? '🔥 Perfect Week!' : data.adherence >= 80 ? '💪 Strong Week' : '⚡ Room to Improve'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {data.weeklyWorkouts}/{data.plannedWorkouts} workouts completed ({data.adherence}%)
          </div>
        </div>

        {/* Exercise Progress */}
        {data.adherence > 0 && (
          <div className="space-y-2">
            {data.benchPressWeight > 0 && (
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="text-xs font-semibold text-green-800">💪 Bench Press (Avg)</div>
                <div className="text-xs text-green-700">
                  {data.benchPressReps} reps × {data.benchPressWeight}kg
                  {data.progression > 0 && (
                    <span className="ml-2 text-green-600 font-bold">
                      +{data.progression}% from last week!
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {data.squatWeight > 0 && (
              <div className="bg-blue-50 p-2 rounded-lg">
                <div className="text-xs font-semibold text-blue-800">🏋️ Squat (Avg)</div>
                <div className="text-xs text-blue-700">
                  {data.squatReps} reps × {data.squatWeight}kg
                  {data.progression > 0 && (
                    <span className="ml-2 text-blue-600 font-bold">
                      Weekly improvement achieved!
                    </span>
                  )}
                </div>
              </div>
            )}

            {data.workoutDuration > 0 && (
              <div className="bg-purple-50 p-2 rounded-lg">
                <div className="text-xs font-semibold text-purple-800">⏱️ Avg Duration</div>
                <div className="text-xs text-purple-700">{data.workoutDuration} minutes per session</div>
              </div>
            )}

            {data.newPR && (
              <div className="bg-yellow-50 p-2 rounded-lg">
                <div className="text-xs font-semibold text-yellow-800">🏆 Personal Record!</div>
                <div className="text-xs text-yellow-700">New milestone achieved this week</div>
              </div>
            )}
          </div>
        )}

        {/* Weekly Goals */}
        {data.perfectWeek && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg">
            <div className="text-xs text-green-700 font-medium">🎯 Perfect week completed!</div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const FitnessTrendChart: React.FC<FitnessTrendChartProps> = ({ data, selectedRange }) => {
  const filteredData = useMemo(() => {
    const now = new Date();
    let rangeInWeeks = 4;
    if (selectedRange === '12w') rangeInWeeks = 12;
    if (selectedRange === '24w') rangeInWeeks = 24;

    return data.filter(d => {
      const date = new Date(d.date);
      const diffInTime = now.getTime() - date.getTime();
      const diffInWeeks = diffInTime / (1000 * 3600 * 24 * 7);
      return diffInWeeks <= rangeInWeeks;
    });
  }, [selectedRange, data]);

  // Weekly aggregated fitness data for visualization
  const dummyFitnessData = useMemo(() => {
    const fitnessData = [];
    const today = new Date();
    const weeks = selectedRange === '4w' ? 4 : selectedRange === '12w' ? 12 : 24;
    
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() - 6);
      
      const weekLabel = `Week ${weeks - i}`;
      const dateLabel = `${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekStart.toLocaleDateString('en-US', { day: 'numeric' })}`;
      
      // Simulate weekly workout data with realistic progression
      const weeklyWorkouts = Math.floor(Math.random() * 3) + 3; // 3-5 workouts per week
      const completedWorkouts = Math.floor(weeklyWorkouts * (0.7 + Math.random() * 0.3)); // 70-100% completion
      const weeklyAdherence = Math.round((completedWorkouts / weeklyWorkouts) * 100);
      
      // Progressive overload simulation
      const baseWeight = 80 + (weeks - i) * 2; // Progressive increase over weeks
      const benchPress = {
        reps: Math.floor(Math.random() * 3) + 8, // 8-10 reps average
        weight: baseWeight + Math.floor(Math.random() * 10),
        improvement: i % 2 === 0 ? Math.floor(Math.random() * 10) + 2 : 0 // Bi-weekly improvements
      };

      const squat = {
        reps: Math.floor(Math.random() * 3) + 8, // 8-10 reps average
        weight: baseWeight + 20 + Math.floor(Math.random() * 15),
        improvement: i % 3 === 0 ? Math.floor(Math.random() * 8) + 3 : 0 // Every 3 weeks improvements
      };

      fitnessData.push({
        date: weekLabel,
        fullDate: dateLabel,
        adherence: weeklyAdherence,
        benchPressReps: benchPress.reps,
        benchPressWeight: benchPress.weight,
        squatReps: squat.reps,
        squatWeight: squat.weight,
        workoutDuration: Math.floor(Math.random() * 20) + 50, // 50-70 min average
        progression: Math.max(benchPress.improvement, squat.improvement),
        weeklyWorkouts: completedWorkouts,
        plannedWorkouts: weeklyWorkouts,
        // Weekly achievement flags
        newPR: i % 4 === 0, // Personal record every 4 weeks
        perfectWeek: weeklyAdherence === 100, // Perfect adherence
      });
    }
    return fitnessData.reverse();
  }, [selectedRange]);

  const chartData = filteredData.length > 0 ? filteredData : dummyFitnessData;

  const colors = {
    adherence: '#60A5FA',
    benchPress: '#34D399',
    squat: '#F87171',
    progression: '#FBBF24',
  };

  return (
    <Card className="rounded-3xl shadow-xl bg-white/40 backdrop-blur-md border-none p-3 sm:p-4 lg:p-6 md:col-span-2 lg:col-span-3">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Fitness Trend 💪</h3>
      </div>
      <CardContent className="p-0 h-48 sm:h-56 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="date" 
              className="text-xs text-gray-500" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              className="text-xs text-gray-500" 
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<EnhancedFitnessTooltip />} />
            
            {/* Adherence as interactive bars with hover effects */}
            <Bar 
              dataKey="adherence" 
              fill={colors.adherence} 
              radius={[6, 6, 0, 0]}
              cursor="pointer"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
      
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
        <div className="text-center">
          <p className="text-sm sm:text-lg font-bold text-gray-800">{Math.round(chartData.reduce((acc, d) => acc + d.adherence, 0) / chartData.length)}%</p>
          <p className="text-xs text-gray-500">Avg Adherence</p>
        </div>
        <div className="text-center">
          <p className="text-sm sm:text-lg font-bold text-gray-800">{chartData.filter(d => d.adherence === 100).length}</p>
          <p className="text-xs text-gray-500">Perfect Days</p>
        </div>
        <div className="text-center">
          <p className="text-sm sm:text-lg font-bold text-gray-800">{chartData.filter(d => d.adherence === 0).length}</p>
          <p className="text-xs text-gray-500">Skipped Days</p>
        </div>
      </div>
    </Card>
  );
};

export default FitnessTrendChart;