import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type PlanStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface PaymentInfo {
  currentPlan: {
    name: string;
    price: string;
    billingCycle?: string;
    nextBillingDate?: string;
    status: PlanStatus;
    showNextBilling: boolean;
    type: 'subscription' | 'trial' | 'coach' | 'free';
  };
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  } | null;
  subscriptionId: string | null;
}

const SUBSCRIPTION_MAP: Record<
  string,
  { name: string; amount: number; currency: string; billingCycle: string }
> = {
  platform_monthly: {
    name: 'TrainWise Platform (Monthly)',
    amount: 49.99,
    currency: 'USD',
    billingCycle: 'Monthly',
  },
  platform_yearly: {
    name: 'TrainWise Platform (Yearly)',
    amount: 499,
    currency: 'USD',
    billingCycle: 'Yearly',
  },
  premium: {
    name: 'Premium Membership',
    amount: 99.0,
    currency: 'USD',
    billingCycle: 'Monthly',
  },
  standard: {
    name: 'Standard Membership',
    amount: 59.0,
    currency: 'USD',
    billingCycle: 'Monthly',
  },
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
};

export const usePaymentInfo = () => {
  const { profile } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const subscriptionId = profile.stripe_subscription_id;
        const plan = profile.plan;
        const planExpiry = profile.plan_expiry;
        const hasCoach = Boolean(profile.coach_id);
        const isTrial = plan === 'trial';
        const hasSubscription = Boolean(plan && plan !== 'trial');

        let planType: PaymentInfo['currentPlan']['type'] = 'free';
        if (hasSubscription) planType = 'subscription';
        else if (isTrial) planType = 'trial';
        else if (hasCoach) planType = 'coach';

        const expiryDate = planExpiry ? new Date(planExpiry) : null;
        const isExpired = expiryDate ? expiryDate < new Date() : false;
        let status: PlanStatus = 'canceled';
        if (planType === 'subscription' && !isExpired) status = 'active';
        else if (planType === 'subscription' && isExpired) status = 'past_due';
        else if (planType === 'trial' && !isExpired) status = 'trialing';

        let planName = 'Free Plan';
        let priceLabel = 'Free';
        let billingCycle: string | undefined;
        let showNextBilling = false;
        let nextBillingDate: string | undefined;

        if (planType === 'subscription' && plan) {
          const meta = SUBSCRIPTION_MAP[plan] || {
            name: 'Platform Subscription',
            amount: 0,
            currency: 'USD',
            billingCycle: 'Monthly',
          };
          planName = meta.name;
          priceLabel =
            meta.amount > 0
              ? `${formatCurrency(meta.amount, meta.currency)}`
              : 'Included';
          billingCycle = meta.billingCycle;
          if (planExpiry) {
            nextBillingDate = formatDate(planExpiry);
            showNextBilling = true;
          }
        } else if (planType === 'trial') {
          planName = 'Free Trial';
          priceLabel = 'Free';
          billingCycle = '7-day trial';
        } else if (planType === 'coach') {
          planName = 'Coach Plan';
          // Attempt to fetch the last accepted coach offer for pricing
          let coachPriceLabel: string | null = null;
          if (profile.coach_id) {
            const { data: coachOffer } = await supabase
              .from('coach_offers')
              .select('price')
              .eq('customer_id', profile.id)
              .eq('coach_id', profile.coach_id)
              .in('status', ['accepted'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (coachOffer?.price != null) {
              coachPriceLabel = formatCurrency(Number(coachOffer.price) || 0, 'USD');
            }
          }
          priceLabel = coachPriceLabel || 'Coach provided pricing';
          billingCycle = 'Per coach agreement';
          if (planExpiry) {
            nextBillingDate = formatDate(planExpiry);
            showNextBilling = true;
          }
        }

        const currentPlan = {
          name: planName,
          price: priceLabel,
          billingCycle,
          nextBillingDate,
          status,
          showNextBilling,
          type: planType,
        };

        const paymentMethod =
          planType === 'subscription' && subscriptionId
            ? {
                brand: 'Visa',
                last4: '4242',
                expiry: '12/25',
              }
            : null;

        setPaymentInfo({
          currentPlan,
          paymentMethod,
          subscriptionId
        });
      } catch (err) {
        console.error('Error fetching payment info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment info');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [profile]);

  return {
    paymentInfo,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setPaymentInfo(null);
    },
  };
};
