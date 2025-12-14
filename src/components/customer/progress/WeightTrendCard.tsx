// src/components/customer/progress/WeightTrendCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Weight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWeightTracking } from '@/hooks/useWeightTracking';

export default function WeightTrendCard() {
  const { entries, getLatestWeight, getWeightTrend, getWeightHistory } = useWeightTracking();
  
  const latestWeight = getLatestWeight();
  const weightTrend = getWeightTrend();
  const weightHistory = getWeightHistory(7); // Last 7 days

  const getTrendIcon = () => {
    if (weightTrend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (weightTrend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (weightTrend > 0) return 'text-red-500';
    if (weightTrend < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  const formatTrend = () => {
    if (weightTrend === 0) return 'No change';
    const sign = weightTrend > 0 ? '+' : '';
    return `${sign}${weightTrend.toFixed(1)} kg`;
  };

  return (
    <motion.div
      className="bg-card dark:bg-[#0d1218] p-4 sm:p-6 rounded-2xl border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Weight Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {latestWeight ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{latestWeight} kg</p>
                <p className="text-sm text-muted-foreground">Current weight</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">{formatTrend()}</span>
                </div>
                <p className="text-xs text-muted-foreground">vs previous</p>
              </div>
            </div>

            {weightHistory.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Last 7 days</p>
                <div className="space-y-1">
                  {weightHistory.slice(0, 3).map((entry, index) => (
                    <div key={entry.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{entry.weight_kg} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Weight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No Weight Data Yet</h4>
            <p className="text-muted-foreground max-w-md mx-auto">
              Do a weigh-in or progression photo to track your progress and see how your body changes over time.
            </p>
          </div>
        )}
      </CardContent>
    </motion.div>
  );
}
