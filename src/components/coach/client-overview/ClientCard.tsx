import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, CheckCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRealTimeClientStatus } from '@/hooks/useRealTimeClientStatus';

interface ClientCardProps {
  clientId: string;
  index: number;
}

const ClientCard = ({ clientId, index }: ClientCardProps) => {
  const navigate = useNavigate();
  const { clients, loading } = useRealTimeClientStatus();
  const clientStatus = clients.find(c => c.id === clientId);

  const handleChatClick = () => {
    if (clientStatus) {
      navigate(`/coach/messages?client=${clientId}&name=${encodeURIComponent(clientStatus.full_name)}`);
    }
  };

  const getStatusBadge = () => {
    if (!clientStatus) return null;

    const statusConfig = {
      no_status: { 
        label: 'No Status', 
        icon: Clock,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      waiting_offer: { 
        label: 'Waiting Offer', 
        icon: DollarSign,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      missing_program: { 
        label: 'Missing Program', 
        icon: AlertCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      program_active: { 
        label: 'Program Active', 
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      on_track: { 
        label: 'On Track', 
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      off_track: { 
        label: 'Off Track', 
        icon: AlertCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      soon_to_expire: { 
        label: 'Soon to Expire', 
        icon: Clock,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    };

    const config = statusConfig[clientStatus.status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={cn("rounded-full flex items-center gap-1", config.className)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getBadgeIcons = () => {
    if (!clientStatus) return [];

    const badgeIcons = [];
    if (clientStatus.badges.new_message) badgeIcons.push({ icon: MessageCircle, label: 'New Message' });
    if (clientStatus.badges.awaiting_checkin) badgeIcons.push({ icon: Clock, label: 'Awaiting Check-in' });
    if (clientStatus.badges.new_feedback) badgeIcons.push({ icon: CheckCircle, label: 'New Feedback' });
    return badgeIcons;
  };

  const getActionButton = () => {
    if (!clientStatus) return null;

    switch (clientStatus.status) {
      case 'no_status':
        return (
          <Button variant="outline" size="sm" className="flex-1" onClick={handleChatClick}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Review Request
          </Button>
        );
      case 'waiting_offer':
        return (
          <Button variant="default" size="sm" className="flex-1" onClick={handleChatClick}>
            <DollarSign className="w-4 h-4 mr-1" />
            Send Offer
          </Button>
        );
      case 'missing_program':
        return (
          <Button variant="default" size="sm" className="flex-1" onClick={handleChatClick}>
            <AlertCircle className="w-4 h-4 mr-1" />
            Assign Program
          </Button>
        );
      case 'off_track':
        return (
          <Button variant="outline" size="sm" className="flex-1" onClick={handleChatClick}>
            <AlertCircle className="w-4 h-4 mr-1" />
            Check In
          </Button>
        );
      case 'soon_to_expire':
        return (
          <Button variant="default" size="sm" className="flex-1" onClick={handleChatClick}>
            <Clock className="w-4 h-4 mr-1" />
            Send Renewal
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className="flex-1" onClick={handleChatClick}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardContent className="p-4 space-y-3">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientStatus) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
              <img 
                className="aspect-square h-full w-full" 
                src={clientStatus.avatar_url || `https://i.pravatar.cc/150?u=${clientStatus.id}`} 
                alt={clientStatus.full_name} 
              />
            </span>
          <div className="flex-1">
            <p className="text-base font-semibold">{clientStatus.full_name}</p>
            <p className="text-xs text-muted-foreground">{clientStatus.plan || 'Free'} Plan</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Badge Icons */}
            {getBadgeIcons().map((badge, index) => (
              <div key={index} className="relative" title={badge.label}>
                <badge.icon className="w-4 h-4 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            ))}
            
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="flex gap-2">
          {getActionButton()}
          
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to={`/coach/clients/${clientStatus.id}`}>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Link>
          </Button>
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClientCard;
