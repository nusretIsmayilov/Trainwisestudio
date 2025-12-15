import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasUsedTrial?: boolean;
  onStartTrial?: () => void;
  onUpgrade: () => void;
}

const PaymentPlanModal = ({ 
  isOpen, 
  onClose, 
  hasUsedTrial = false, 
  onStartTrial,
  onUpgrade 
}: PaymentPlanModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Unlock Your Wellness Journey
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="text-center text-muted-foreground">
            Ready to transform your health and wellness? Choose a plan to continue.
          </div>
          
          <div className="space-y-3">
            {!hasUsedTrial && onStartTrial && (
              <Button 
                onClick={onStartTrial}
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Start 7-Day Free Trial
              </Button>
            )}
            
            <Button 
              onClick={onUpgrade}
              className="w-full flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Choose a payment plan
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            Cancel anytime. No hidden fees.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPlanModal;