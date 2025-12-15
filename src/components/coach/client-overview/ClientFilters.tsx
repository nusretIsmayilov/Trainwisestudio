import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  MessageCircle,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ClientFiltersProps {
  onFilterChange: (filters: {
    status: string[];
    badges: string[];
  }) => void;
  totalCount?: number;
  filteredCount?: number;
}

const ClientFilters = ({ onFilterChange, totalCount = 0, filteredCount = 0 }: ClientFiltersProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const statusOptions = [
    { value: 'no_status', label: 'No Status', icon: Clock, color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' },
    { value: 'waiting_offer', label: 'Waiting Offer', icon: DollarSign, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
    { value: 'missing_program', label: 'Missing Program', icon: AlertCircle, color: 'bg-red-500/10 text-red-700 dark:text-red-300' },
    { value: 'program_active', label: 'Program Active', icon: CheckCircle, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
    { value: 'on_track', label: 'On Track', icon: CheckCircle, color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
    { value: 'off_track', label: 'Off Track', icon: AlertCircle, color: 'bg-red-500/10 text-red-700 dark:text-red-300' },
    { value: 'soon_to_expire', label: 'Soon to Expire', icon: Clock, color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' }
  ];

  const badgeOptions = [
    { value: 'new_message', label: 'New Message', icon: MessageCircle, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
    { value: 'awaiting_checkin', label: 'Awaiting Check-in', icon: Clock, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
    { value: 'new_feedback', label: 'New Feedback', icon: CheckCircle, color: 'bg-green-500/10 text-green-700 dark:text-green-300' }
  ];

  const handleStatusToggle = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(newStatus);
    onFilterChange({ status: newStatus, badges: selectedBadges });
  };

  const handleBadgeToggle = (badge: string) => {
    const newBadges = selectedBadges.includes(badge)
      ? selectedBadges.filter(b => b !== badge)
      : [...selectedBadges, badge];
    setSelectedBadges(newBadges);
    onFilterChange({ status: selectedStatus, badges: newBadges });
  };

  const clearFilters = () => {
    setSelectedStatus([]);
    setSelectedBadges([]);
    onFilterChange({ status: [], badges: [] });
  };

  const hasActiveFilters = selectedStatus.length > 0 || selectedBadges.length > 0;
  const activeFilterCount = selectedStatus.length + selectedBadges.length;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        {/* Header - Always Visible */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{t('clients.filterClients')}</h3>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters 
                  ? `${filteredCount} of ${totalCount} clients`
                  : `${totalCount} total clients`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="mr-2">
                {activeFilterCount} active
              </Badge>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters Pills - Always Visible */}
        {hasActiveFilters && (
          <div className="mb-4 pb-4 border-b">
            <div className="flex flex-wrap gap-2">
              {selectedStatus.map((status) => {
                const option = statusOptions.find(o => o.value === status);
                return (
                  <Badge 
                    key={status} 
                    variant="secondary" 
                    className="text-xs px-2 py-1 flex items-center gap-1"
                  >
                    {option?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleStatusToggle(status)}
                    />
                  </Badge>
                );
              })}
              {selectedBadges.map((badge) => {
                const option = badgeOptions.find(o => o.value === badge);
                return (
                  <Badge 
                    key={badge} 
                    variant="secondary" 
                    className="text-xs px-2 py-1 flex items-center gap-1"
                  >
                    {option?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleBadgeToggle(badge)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Expandable Filter Options */}
        {isExpanded && (
          <div className="space-y-4 pt-2">
            {/* Status Filters */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('clients.status')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedStatus.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusToggle(option.value)}
                      className={cn(
                        "h-8 text-xs transition-all",
                        isSelected 
                          ? option.color + " border-0" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-3 h-3 mr-1.5" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Badge Filters */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('clients.badges')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {badgeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedBadges.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleBadgeToggle(option.value)}
                      className={cn(
                        "h-8 text-xs transition-all",
                        isSelected 
                          ? option.color + " border-0" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-3 h-3 mr-1.5" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientFilters;
