import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { syncCheckoutSession } from '@/lib/stripe/api';
import { toast } from 'sonner';

// Runs globally on every page load; if URL contains Stripe success params, syncs and then cleans URL
// Handles both subscription payments (status=success) and coach offer payments (offer_status=paid)
const StripeSyncHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessedSync = useRef<string | null>(null);

  useEffect(() => {
    // Only show warning in production or when Stripe features are actually used
    if (import.meta.env.PROD && (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || !import.meta.env.VITE_API_BASE_URL)) {
      // eslint-disable-next-line no-console
      console.warn('[Stripe] Missing envs: VITE_STRIPE_PUBLISHABLE_KEY or VITE_API_BASE_URL');
    }
    
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const offerStatus = params.get('offer_status');
    const sessionId = params.get('session_id');
    
    // Handle subscription payments (status=success)
    if (status === 'success' && sessionId) {
      // Prevent duplicate processing
      if (hasProcessedSync.current === sessionId) {
        console.log('[Frontend] Global StripeSyncHandler: already processed this session', sessionId);
        return;
      }
      
      console.log('[Frontend] Global StripeSyncHandler: syncing subscription session', sessionId);
      hasProcessedSync.current = sessionId;
      
      syncCheckoutSession(sessionId)
        .then((data) => {
          console.log('[Frontend] Global StripeSyncHandler: subscription sync response', data);
          if (data && (data as any).ok) {
            toast.success('Subscription activated successfully. Plan info updated.');
          } else {
            toast.error(`Subscription sync failed: ${(data as any)?.error || 'Unknown error'}`);
          }
        })
        .catch((err) => {
          console.error('[Frontend] Global StripeSyncHandler: subscription sync error', err);
          toast.error('Subscription sync failed due to a network error.');
        })
        .finally(() => {
          hasProcessedSync.current = null;
          // Clean URL: remove status and session_id but keep the current path
          const cleanUrl = location.pathname;
          navigate(cleanUrl, { replace: true });
        });
    }
    
    // Handle coach offer payments (offer_status=paid)
    if (offerStatus === 'paid' && sessionId) {
      // Prevent duplicate processing
      if (hasProcessedSync.current === sessionId) {
        console.log('[Frontend] Global StripeSyncHandler: already processed this offer session', sessionId);
        return;
      }
      
      console.log('[Frontend] Global StripeSyncHandler: syncing offer payment session', sessionId);
      hasProcessedSync.current = sessionId;
      
      syncCheckoutSession(sessionId)
        .then((data) => {
          console.log('[Frontend] Global StripeSyncHandler: offer sync response', data);
          if (data && ((data as any).status === 'accepted' || (data as any).ok)) {
            toast.success('🎉 Your coaching offer has been accepted! Your coaching plan is now active.');
            
            // Dispatch custom event to trigger message refetch in ChatView
            window.dispatchEvent(new CustomEvent('offer-status-updated', { 
              detail: { offerId: (data as any).offerId, status: 'accepted' } 
            }));
          } else {
            toast.error(`Offer sync failed: ${(data as any)?.error || 'Unknown error'}`);
          }
        })
        .catch((err) => {
          console.error('[Frontend] Global StripeSyncHandler: offer sync error', err);
          toast.error('Offer sync failed due to a network error.');
        })
        .finally(() => {
          hasProcessedSync.current = null;
          // Clean URL: remove offer_status and session_id but keep the current path
          const cleanUrl = location.pathname;
          navigate(cleanUrl, { replace: true });
        });
    }
    
    // Handle cancelled payments
    if (offerStatus === 'cancel') {
      toast.info('Payment was cancelled. You can try again when ready.');
      const cleanUrl = location.pathname;
      navigate(cleanUrl, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return null;
};

export default StripeSyncHandler;


