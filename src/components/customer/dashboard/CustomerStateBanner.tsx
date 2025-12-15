import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CustomerStateBanner = () => {
  const { profile } = useAuth();
  const [states, setStates] = useState<any | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('customer_states')
        .select('*')
        .eq('customer_id', profile.id)
        .limit(1);
      setStates(data?.[0] || null);
    };
    fetchStates();
  }, [profile?.id]);

  if (!states) return null;

  return (
    <div className="space-y-3">
      {states.missing_program && (
        <Alert>
          <AlertTitle>No active program</AlertTitle>
          <AlertDescription>Ask your coach for an assignment or generate a free AI plan.</AlertDescription>
        </Alert>
      )}
      {states.needs_feedback && (
        <Alert>
          <AlertTitle>Coach requested feedback</AlertTitle>
          <AlertDescription>Open Messages to respond to your coach.</AlertDescription>
        </Alert>
      )}
      {states.soon_to_expire && (
        <Alert>
          <AlertTitle>Plan expiring soon</AlertTitle>
          <AlertDescription>Renew your subscription to keep access.</AlertDescription>
        </Alert>
      )}
      {states.off_track && (
        <Alert>
          <AlertTitle>Let’s get back on track</AlertTitle>
          <AlertDescription>Log a check-in or complete today’s program.</AlertDescription>
        </Alert>
      )}
      {states.program_expired && (
        <Alert variant="destructive">
          <AlertTitle>Access expired</AlertTitle>
          <AlertDescription>Renew to continue with programs and library.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CustomerStateBanner;


