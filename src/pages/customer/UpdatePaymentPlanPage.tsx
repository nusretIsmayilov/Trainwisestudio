import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Shield, Zap, Clock } from 'lucide-react';
import PlanSelectionCard from '@/components/customer/payment/PlanSelectionCard';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/lib/stripe/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';

const UpdatePaymentPlanPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { detectedCurrency, getCurrencyOption, loading: currencyLoading } = useCurrencyDetection();

  const handlePlanSelect = (planKey: string) => {
    setSelectedPlan(planKey);
  };

  useEffect(() => {
    if (!selectedPlan) {
      setSelectedPlan('all-access');
    }
  }, [selectedPlan]);

  const handleConfirmUpdate = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setIsProcessing(true);
    try {
      const planKeyMap: Record<string, { priceKey: string; trialDays?: number }> = {
        'all-access': { priceKey: 'platform_monthly' },
        premium: { priceKey: 'platform_monthly' },
        standard: { priceKey: 'platform_monthly', trialDays: 7 },
        basic: { priceKey: 'platform_monthly' },
      };
      const mapped = planKeyMap[selectedPlan] || { priceKey: selectedPlan };
      const { checkoutUrl } = await createCheckoutSession({
        ...mapped,
        currency: detectedCurrency,
        stripeCustomerId: profile?.stripe_customer_id ?? null,
        userId: profile?.id,
      });
      window.location.href = checkoutUrl;
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  const currencyOption = getCurrencyOption(detectedCurrency);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/customer/settings')}
            size="icon"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Update Your Plan</h1>
            <p className="text-sm text-muted-foreground">
              Unlock your full potential
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Transform Your Health Journey</h2>
            <p className="text-primary-foreground/80 text-sm">
              Get personalized fitness, nutrition, and mindfulness programs designed just for you.
            </p>
          </div>
        </div>

        {/* Plan Card */}
        <PlanSelectionCard
          onSelectPlan={handlePlanSelect}
          selectedPlan={selectedPlan}
          detectedCurrency={detectedCurrency}
          currencyLoading={currencyLoading}
        />

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-center text-muted-foreground font-medium">Secure Payment</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-center text-muted-foreground font-medium">Cancel Anytime</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-center text-muted-foreground font-medium">Instant Access</span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to start?</p>
                {currencyLoading ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 animate-pulse" />
                    Detecting region...
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {currencyOption.country}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{currencyOption.price}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
            
            <Button
              onClick={handleConfirmUpdate}
              disabled={isProcessing || currencyLoading}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isProcessing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Bottom padding for fixed CTA */}
      <div className="h-36" />
    </div>
  );
};

export default UpdatePaymentPlanPage;
