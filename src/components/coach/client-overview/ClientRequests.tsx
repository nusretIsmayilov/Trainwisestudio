// src/components/coach/client-overview/ClientRequests.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCoachRequests } from '@/hooks/useCoachRequests';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ClientRequestsProps {
  onClientClick: (clientId: string) => void;
  onRequestAccepted?: () => void;
}

const ClientRequests = ({ onClientClick, onRequestAccepted }: ClientRequestsProps) => {
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [acceptedClients, setAcceptedClients] = useState<Set<string>>(new Set());
  const { requests, loading, acceptRequest, rejectRequest } = useCoachRequests();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  console.log('ClientRequests: Component rendered');
  console.log('ClientRequests: loading:', loading);
  console.log('ClientRequests: requests:', requests);

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    setProcessingRequests(prev => new Set([...prev, requestId]));

    try {
      let success = false;
      if (action === 'accepted') {
        success = await acceptRequest(requestId);
      } else {
        success = await rejectRequest(requestId);
      }

      if (!success) {
        // Handle error - could show toast notification
        console.error('Failed to process request');
        toast.error('Failed to process request. Please try again.');
      } else if (action === 'accepted') {
        // Mark client as accepted
        const request = requests.find(r => r.id === requestId);
        if (request) {
          setAcceptedClients(prev => new Set([...prev, request.customer_id]));
          toast.success(`Request accepted! ${request.customer?.full_name || 'Client'} is now your client.`, {
            action: {
              label: 'Start Chat',
              onClick: () => navigate(`/coach/messages?client=${request.customer_id}&name=${encodeURIComponent(request.customer?.full_name || 'Client')}`)
            }
          });
        }
        
        // Notify parent component that a request was accepted
        if (onRequestAccepted) {
          onRequestAccepted();
        }
      } else if (action === 'rejected') {
        toast.success('Request declined.');
      }
    } catch (error) {
      console.error('Error handling request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('clients.loadingRequests')}</p>
        </div>
      </div>
    );
  }

  if (!requests.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{t('clients.incomingRequests')} 👋</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div onClick={() => {
              console.log('ClientRequests: Card clicked for customer:', request.customer_id);
              onClientClick(request.customer_id);
            }} className="block">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl cursor-pointer">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-md font-semibold text-primary">
                     {t('clients.newRequest')}
                   </CardTitle>
                   <ArrowRight className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                <CardContent className="space-y-3">
                   <div className="flex items-center gap-3">
                     <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
                       <img 
                         className="aspect-square h-full w-full" 
                         src={request.customer?.avatar_url || `https://i.pravatar.cc/150?u=${request.customer_id}`} 
                         alt={request.customer?.full_name || 'Customer'} 
                       />
                     </span>
                     <div className="flex flex-col">
                       <p className="text-lg font-bold">{request.customer?.full_name || t('clients.newCustomer')}</p>
                       <p className="text-sm text-muted-foreground">{request.customer?.email || t('clients.noEmailProvided')}</p>
                       <p className="text-xs text-muted-foreground">{request.customer?.plan || t('clients.freePlan')}</p>
                     </div>
                   </div>
                  {acceptedClients.has(request.customer_id) ? (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/coach/messages?client=${request.customer_id}&name=${encodeURIComponent(request.customer?.full_name || 'Client')}`);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t('clients.startChat')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClientClick(request.customer_id);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {t('clients.viewProfile')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-green-600 hover:text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'accepted');
                        }}
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {t('clients.accept')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'rejected');
                        }}
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {t('clients.decline')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientRequests;