import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Users, CheckCircle2 } from 'lucide-react';

interface LockedOverlayProps {
  title: string;
  description: string;
  benefits: string[];
  onUpgrade: () => void;
  onFindCoach: () => void;
}

const LockedOverlay = ({
  title,
  description,
  benefits,
  onUpgrade,
  onFindCoach,
}: LockedOverlayProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4 z-20">
      <Card className="max-w-lg w-full border-orange-200/70 dark:border-orange-800/60 bg-white/95 dark:bg-gray-950/95 shadow-2xl">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/40">
              <Crown className="w-7 h-7 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
          </div>
          <ul className="space-y-2 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={onUpgrade}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe Now
            </Button>
            <Button 
              onClick={onFindCoach}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Find a Coach
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LockedOverlay;


