// src/components/coach/clientCard/ClientHeader.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRealTimeClientData } from '@/hooks/useRealTimeClientData';

interface ClientHeaderProps {
  client: any | null;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ client }) => {
  const { clientData, loading } = useRealTimeClientData(client?.id);

  if (loading) {
    return (
      <div className="bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-md p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="h-6 w-6 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-md p-4 sm:p-6">
        <p className="text-muted-foreground">No client data available</p>
      </div>
    );
  }

  const lastCheckInDate = clientData.checkinHistory?.[0]?.date 
    ? new Date(clientData.checkinHistory[0].date)
    : new Date();
  const lastCheckIn = lastCheckInDate.toLocaleDateString('en-GB');

  const hasNewFeedback = clientData.checkinHistory?.some(c => c.status === 'responded' && 
    new Date(c.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)) || false;
  
  const onTrack = clientData.adherence >= 70; // Consider on track if adherence is 70% or higher

  // Safeguards for not-yet-loaded client
  const name = clientData.full_name || 'Customer';
  const avatar = clientData.avatar_url || 'https://placehold.co/96x96';
  const adherence = `${clientData.adherence}%`;

  return (
    <motion.div
      className="bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-md p-4 sm:p-6 overflow-hidden flex flex-col gap-6"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <motion.img
            className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover border border-border shadow-sm"
            src={avatar}
            alt={name}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {onTrack && (
                <Badge className="rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium bg-green-500/10 text-green-600 border-green-500/20">
                  On Track
                </Badge>
              )}
              {hasNewFeedback && (
                <Badge className="rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium bg-yellow-500/10 text-yellow-600 border-yellow-500/20 animate-pulse">
                  💬 New Feedback
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
        {[
          { 
            icon: Calendar, 
            label: 'Last Check-in', 
            value: lastCheckIn 
          },
          { 
            icon: Award, 
            label: 'Adherence', 
            value: adherence 
          },
          { 
            icon: Clock, 
            label: 'Program Days', 
            value: clientData.programDays.total > 0 
              ? `${clientData.programDays.remaining} remaining`
              : 'No program assigned'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center justify-center"
            whileHover={{ y: -2 }}
          >
            <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mb-1" />
            <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            <div className="font-semibold text-sm sm:text-base">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ClientHeader;
