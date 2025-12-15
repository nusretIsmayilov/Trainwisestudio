import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check } from 'lucide-react';
import { customerProfile } from '@/mockdata/profile/profileData';

interface PaymentMethodCardProps {
  showUpdateButton?: boolean;
  onUpdate?: () => void;
}

const PaymentMethodCard = ({ showUpdateButton = true, onUpdate }: PaymentMethodCardProps) => {
  const { payment } = customerProfile;

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-muted rounded-lg">
          <div className="space-y-1 text-sm sm:text-base">
            <p className="font-medium">{payment.paymentMethod.brand} •••• {payment.paymentMethod.last4}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Expires {payment.paymentMethod.expiry}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
            <Check className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        {showUpdateButton && (
          <Button variant="outline" onClick={onUpdate} className="w-full">
            Update Payment Method
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
