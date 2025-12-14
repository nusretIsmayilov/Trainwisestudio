// src/components/customer/progress/DailyCheckinTrends.tsx
import { DailyCheckin } from '@/mockdata/progress/mockProgressData';
import CheckinTrendCard from './CheckinTrendCard'; // We will create this component next
import { Droplets, Moon, Zap, Smile } from 'lucide-react';

interface DailyCheckinTrendsProps {
    checkins: DailyCheckin[];
    onCardClick: (title: string, content: React.ReactNode) => void;
}

export default function DailyCheckinTrends({ checkins, onCardClick }: DailyCheckinTrendsProps) {
    const last7Days = checkins.slice(-7);
    const avg = (key: keyof DailyCheckin) => last7Days.length > 0 
        ? last7Days.reduce((acc, curr) => acc + (curr[key] as number), 0) / last7Days.length 
        : 0;
    
    const trendData = [
        {
            title: "Water Intake",
            icon: "💧",
            value: `${avg('waterLiters').toFixed(1)} L`,
            data: last7Days,
            dataKey: "waterLiters",
            color: "blue",
            gradient: "from-blue-400 to-blue-600",
            insight: "Hydration is key for energy and muscle recovery. Keep it up!",
        },
        {
            title: "Sleep",
            icon: "😴",
            value: `${avg('sleepHours').toFixed(1)} hrs`,
            data: last7Days,
            dataKey: "sleepHours",
            color: "purple",
            gradient: "from-purple-400 to-purple-600",
            insight: "Quality sleep is when your body repairs itself. Aim for 7-9 hours.",
        },
        {
            title: "Energy",
            icon: "⚡️",
            value: `${avg('energyLevel').toFixed(1)} / 5`,
            data: last7Days,
            dataKey: "energyLevel",
            color: "yellow",
            gradient: "from-yellow-400 to-yellow-600",
            insight: "Your energy levels are directly linked to sleep and nutrition.",
        },
        {
            title: "Mood",
            icon: "😊",
            value: "Good", // This is simplified, a real app would calculate this
            data: last7Days.map(c => ({...c, moodScore: c.mood === 'great' ? 4 : c.mood === 'good' ? 3 : c.mood === 'okay' ? 2 : 1})),
            dataKey: "moodScore",
            color: "emerald",
            gradient: "from-emerald-400 to-emerald-600",
            insight: "Consistent workouts are a great way to boost your mood.",
        },
    ];

    // Check if we have minimum data for meaningful trends (at least 3 days)
    const hasMinimumData = last7Days.length >= 3;
    const hasAnyData = last7Days.length > 0;

    return (
        <div>
            <h2 className="text-xl font-bold tracking-tight mb-4">Daily Check-in Trends</h2>
            {hasMinimumData ? (
                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide-tablet lg:scrollbar-thin lg:scrollbar-thumb-muted-foreground/20 lg:scrollbar-track-transparent">
                    {trendData.map((trend) => (
                        <CheckinTrendCard 
                            key={trend.title}
                            {...trend}
                            onClick={() => onCardClick(trend.title, <p>{trend.insight}</p>)}
                        />
                    ))}
                </div>
            ) : hasAnyData ? (
                <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <div className="text-xl">📈</div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Building Your Trends</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Keep tracking for a few more days to see meaningful trends and patterns in your wellness data.
                    </p>
                    <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                        {3 - last7Days.length} more days needed for trend analysis
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <div className="text-2xl">📊</div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Trend Data Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Complete your daily check-ins to start seeing your wellness trends and progress over time.
                    </p>
                </div>
            )}
        </div>
    );
}
