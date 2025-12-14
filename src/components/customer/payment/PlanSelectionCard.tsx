import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, Star, Loader2 } from 'lucide-react';
import { PLANS } from '@/mockdata/landingpage/plans';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';

interface PlanSelectionCardProps {
  onSelectPlan: (planKey: string) => void;
  selectedPlan?: string;
  detectedCurrency: string;
  currencyLoading: boolean;
}

const PlanSelectionCard = ({ onSelectPlan, selectedPlan, detectedCurrency, currencyLoading }: PlanSelectionCardProps) => {
  const { getCurrencyOption } = useCurrencyDetection();
  const plan = PLANS[0]; // Single plan
  const currencyOption = getCurrencyOption(detectedCurrency);

  // Auto-select plan on mount
  useEffect(() => {
    if (!selectedPlan) {
      onSelectPlan(plan.planKey);
    }
  }, [selectedPlan, onSelectPlan, plan.planKey]);

  return (
    <Card className="relative w-full transition-all shadow-md border-border/50">
      <CardHeader className="text-center pb-3 pt-6 space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {plan.name} Membership
        </CardTitle>
        
        <div className="space-y-1">
          {currencyLoading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Detecting your region...</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight">{currencyOption.price}</span>
                <span className="text-muted-foreground text-base">/{plan.period}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pricing for {currencyOption.country}
              </p>
            </>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{plan.summary}</p>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="grid sm:grid-cols-2 gap-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span className="text-sm leading-tight">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSelectionCard;
