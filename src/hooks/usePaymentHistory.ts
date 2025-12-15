import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  currency: string;
}

export const usePaymentHistory = () => {
  const { profile } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // For now, we'll create some sample data based on the user's subscription
        // In a real app, you'd fetch this from Stripe API or a payments table
        const history: PaymentHistoryItem[] = [];

        if (profile.plan === 'premium' && profile.plan_expiry) {
          // Add subscription payments
          const startDate = new Date(profile.created_at);
          const endDate = new Date(profile.plan_expiry);
          const currentDate = new Date(startDate);

          while (currentDate < endDate) {
            history.push({
              id: `sub_${currentDate.getTime()}`,
              date: currentDate.toLocaleDateString(),
              description: 'Monthly Subscription',
              amount: '$49.99',
              status: 'succeeded',
              currency: 'USD'
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        }

        // Add any one-time payments if they exist
        // This would come from a payments table in a real app
        if (profile.plan === 'premium') {
          history.push({
            id: 'setup_1',
            date: new Date(profile.created_at).toLocaleDateString(),
            description: 'Account Setup',
            amount: '$0.00',
            status: 'succeeded',
            currency: 'USD'
          });
        }

        setPaymentHistory(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [profile]);

  return {
    paymentHistory,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setPaymentHistory([]);
    }
  };
};
