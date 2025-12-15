import { DailyCheckinRecord } from '@/hooks/useDailyCheckins';

export interface TrendData {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  hasEnoughData: boolean;
}

export interface TrendAnalysis {
  dailyCheckins: {
    water: TrendData | null;
    mood: TrendData | null;
    energy: TrendData | null;
    sleep: TrendData | null;
  };
  programEntries: {
    fitness: TrendData | null;
    nutrition: TrendData | null;
    mental: TrendData | null;
  };
  overall: {
    consistency: TrendData | null;
    engagement: TrendData | null;
  };
}

/**
 * Calculate trend for a metric with 3-day minimum data rule
 * @param data Array of data points with date and value
 * @param metricName Name of the metric for logging
 * @param getValue Function to extract value from data point
 * @returns TrendData or null if insufficient data
 */
export function calculateTrend<T>(
  data: T[],
  metricName: string,
  getValue: (item: T) => number | null
): TrendData | null {
  if (!data || data.length < 3) {
    return null;
  }

  // Filter out null values and sort by date
  const validData = data
    .map(item => ({ value: getValue(item), item }))
    .filter(({ value }) => value !== null && value !== undefined)
    .map(({ value, item }) => ({ value: value!, item }))
    .sort((a, b) => {
      // Assuming items have a date field - adjust as needed
      const dateA = new Date((a.item as any).date || (a.item as any).created_at);
      const dateB = new Date((b.item as any).date || (b.item as any).created_at);
      return dateA.getTime() - dateB.getTime();
    });

  if (validData.length < 3) {
    return null;
  }

  const values = validData.map(({ value }) => value);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  // Determine trend direction
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(changePercent) > 5) { // 5% threshold for significant change
    trend = change > 0 ? 'up' : 'down';
  }

  return {
    metric: metricName,
    value: lastValue,
    trend,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    hasEnoughData: true
  };
}

/**
 * Calculate trends for daily check-ins
 */
export function calculateDailyCheckinTrends(checkins: DailyCheckinRecord[]): TrendAnalysis['dailyCheckins'] {
  return {
    water: calculateTrend(checkins, 'water', (item) => item.water_liters),
    mood: calculateTrend(checkins, 'mood', (item) => item.mood),
    energy: calculateTrend(checkins, 'energy', (item) => item.energy),
    sleep: calculateTrend(checkins, 'sleep', (item) => item.sleep_hours)
  };
}

/**
 * Calculate trends for program entries
 */
export function calculateProgramEntryTrends(entries: any[]): TrendAnalysis['programEntries'] {
  const fitnessEntries = entries.filter(e => e.type === 'fitness');
  const nutritionEntries = entries.filter(e => e.type === 'nutrition');
  const mentalEntries = entries.filter(e => e.type === 'mental');

  return {
    fitness: calculateTrend(fitnessEntries, 'fitness', () => 1), // Count entries
    nutrition: calculateTrend(nutritionEntries, 'nutrition', () => 1),
    mental: calculateTrend(mentalEntries, 'mental', () => 1)
  };
}

/**
 * Calculate overall trends
 */
export function calculateOverallTrends(
  checkins: DailyCheckinRecord[],
  entries: any[]
): TrendAnalysis['overall'] {
  // Consistency: based on daily check-in frequency
  const checkinDates = checkins.map(c => new Date(c.date).getTime());
  const uniqueDays = new Set(checkinDates).size;
  const consistencyData = [{ value: uniqueDays, date: new Date() }];
  
  // Engagement: based on program entry frequency
  const entryDates = entries.map(e => new Date(e.created_at).getTime());
  const uniqueEntryDays = new Set(entryDates).size;
  const engagementData = [{ value: uniqueEntryDays, date: new Date() }];

  return {
    consistency: calculateTrend(consistencyData, 'consistency', (item) => item.value),
    engagement: calculateTrend(engagementData, 'engagement', (item) => item.value)
  };
}

/**
 * Generate comprehensive trend analysis
 */
export function generateTrendAnalysis(
  checkins: DailyCheckinRecord[],
  entries: any[]
): TrendAnalysis {
  return {
    dailyCheckins: calculateDailyCheckinTrends(checkins),
    programEntries: calculateProgramEntryTrends(entries),
    overall: calculateOverallTrends(checkins, entries)
  };
}
