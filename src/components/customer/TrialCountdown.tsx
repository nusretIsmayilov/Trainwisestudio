// src/components/customer/TrialCountdown.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrialCountdown = () => {
  const { profile } = useAuth();
  const { planStatus } = usePaymentPlan();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!profile?.plan_expiry || profile.plan !== 'trial') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(profile.plan_expiry);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [profile?.plan_expiry, profile?.plan]);

  if (!timeRemaining || profile?.plan !== 'trial') {
    return null;
  }

  const isExpired = timeRemaining.days === 0 && timeRemaining.hours === 0 && 
                    timeRemaining.minutes === 0 && timeRemaining.seconds === 0;

  if (isExpired) {
    return (
      <Card className="border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100">Trial Expired</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Upgrade to continue enjoying premium features</p>
              </div>
            </div>
            <Button onClick={() => navigate('/customer/payment/update-plan')} size="sm">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Free Trial Active</p>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {timeRemaining.days} {timeRemaining.days === 1 ? 'day' : 'days'} left
                </Badge>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/customer/payment/update-plan')} 
            variant="outline" 
            size="sm"
            className="border-primary/20 hover:bg-primary/10"
          >
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialCountdown;

