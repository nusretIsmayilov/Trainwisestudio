// src/components/coach/dashboard/ClientOverview.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Clock, CheckCircle, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealTimeClientStatus } from '@/hooks/useRealTimeClientStatus';
import { useTranslation } from 'react-i18next';

const ClientOverview = () => {
  const { clients, loading } = useRealTimeClientStatus();
  const { t } = useTranslation();

  const getStatusConfig = (status: string) => {
    const statusConfigs = {
      'no_status': { 
        label: t('clientStatus.noStatus'), 
        icon: Clock, 
        className: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      'waiting_offer': { 
        label: t('clientStatus.waitingOffer'), 
        icon: DollarSign, 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      'missing_program': { 
        label: t('clientStatus.missingProgram'), 
        icon: AlertCircle, 
        className: 'bg-red-100 text-red-800 border-red-200' 
      },
      'program_active': { 
        label: t('clientStatus.programActive'), 
        icon: CheckCircle, 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'on_track': { 
        label: t('clientStatus.onTrack'), 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-800 border-green-200' 
      },
      'off_track': { 
        label: t('clientStatus.offTrack'), 
        icon: AlertCircle, 
        className: 'bg-red-100 text-red-800 border-red-200' 
      },
      'soon_to_expire': { 
        label: t('clientStatus.soonToExpire'), 
        icon: Clock, 
        className: 'bg-orange-100 text-orange-800 border-orange-200' 
      }
    };
    return statusConfigs[status as keyof typeof statusConfigs] || statusConfigs['no_status'];
  };

  const getBadgeIcons = (badges: any) => {
    const badgeIcons = [];
    if (badges.new_message) badgeIcons.push(MessageCircle);
    if (badges.awaiting_checkin) badgeIcons.push(Clock);
    if (badges.new_feedback) badgeIcons.push(CheckCircle);
    return badgeIcons;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Client Statuses</h2>
        <p className="text-sm text-muted-foreground -mt-2">An overview of all your clients and their current status.</p>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('common.loading')} {t('dashboard.clientStatuses').toLowerCase()}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{t('dashboard.clientStatuses')}</h2>
      <p className="text-sm text-muted-foreground -mt-2">{t('dashboard.clientStatusesDescription')}</p>
      <div className="space-y-4">
        {clients.slice(0, 5).map((client) => {
          const statusConfig = getStatusConfig(client.status);
          const StatusIcon = statusConfig.icon;
          const badgeIcons = getBadgeIcons(client.badges);
          
          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow duration-300 rounded-xl">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <Link to={`/coach/clients/${client.id}`} className="flex items-center flex-1 gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
                    <img className="aspect-square h-full w-full" src={client.avatar_url || `https://i.pravatar.cc/150?u=${client.id}`} alt={client.full_name || 'Client'} />
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold">{client.full_name || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{client.plan || t('common.free')} {t('common.plan')}</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                  {/* Badge Icons */}
                  {badgeIcons.map((Icon, index) => (
                    <div key={index} className="relative">
                      <Icon className="w-4 h-4 text-primary" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  ))}
                  
                  {/* Status Badge */}
                  <Badge variant="secondary" className={cn("rounded-full flex items-center gap-1", statusConfig.className)}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <ArrowRight size={16} className="text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {clients.length === 0 && (
          <div className="text-sm text-muted-foreground">{t('dashboard.noClientsYet')}</div>
        )}
      </div>
    </div>
  );
};

export default ClientOverview;
