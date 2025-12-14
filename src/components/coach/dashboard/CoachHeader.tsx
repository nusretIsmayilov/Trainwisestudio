// src/components/coach/dashboard/CoachHeader.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpenCheck, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachDashboardStats } from '@/hooks/useCoachDashboard';
import { useRealTimeMotivation } from '@/hooks/useRealTimeMotivation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const CoachHeader = () => {
  const { stats } = useCoachDashboardStats();
  const { motivationMessage, loading: motivationLoading } = useRealTimeMotivation();
  const { profile } = useAuth();
  const { t } = useTranslation();
  
  const metrics = [
    { title: t('dashboard.totalClients'), value: String(stats.totalClients), icon: Users, trend: 'up', trendValue: '', description: t('dashboard.sinceLastMonth') },
    { title: t('dashboard.totalEarning'), value: `$${stats.totalEarning.toLocaleString()}`, icon: DollarSign, trend: 'up', trendValue: '', description: t('dashboard.allTimeNet') },
    { title: t('dashboard.activePrograms'), value: String(stats.activePrograms), icon: BookOpenCheck, trend: 'up', trendValue: '', description: t('dashboard.activeClients') },
    { title: t('dashboard.retentionRate'), value: `${stats.retentionRate}%`, icon: TrendingUp, trend: 'up', trendValue: '', description: t('dashboard.subscribedCustomers') },
  ];
  
  const timeOfDay = new Date().getHours() < 12 ? t('common.morning') : new Date().getHours() < 18 ? t('common.afternoon') : t('common.evening');
  const coachName = profile?.full_name || t('common.coach');

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description }) => {
    return (
      <Card className="min-w-[180px] flex-1 shadow-md border rounded-xl">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {Icon && <Icon size={16} className="text-muted-foreground" />}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold">{value}</p>
            <span className={cn(
              "flex items-center text-xs font-semibold",
              trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
            )}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trendValue}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="relative border-none bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg animate-fade-in-down overflow-hidden rounded-xl">
        <CardContent className="p-6">
          <div className="pr-28">
            <h1 className="text-2xl font-bold">{t('dashboard.goodMorning', { timeOfDay, coachName })} 👋</h1>
            {motivationLoading ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="opacity-80 text-sm italic">{t('dashboard.loadingMotivation')}</p>
              </div>
            ) : motivationMessage ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{motivationMessage.emoji}</span>
                <p className="opacity-80 text-sm italic">"{motivationMessage.content}"</p>
              </div>
            ) : (
              <p className="opacity-80 mt-1 text-sm italic">"{t('dashboard.readyToMakeImpact')}"</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Section */}
      <div className="p-1 -m-1">
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {metrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachHeader;
