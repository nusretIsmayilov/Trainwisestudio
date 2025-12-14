'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// NOTE: Removed DialogTrigger import
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncomeStats } from '@/mockdata/income/mockIncome';

interface WithdrawalModalProps {
  stats: IncomeStats;
  onWithdraw: (amount: number) => void;
  isOpen: boolean; // Must be controlled by parent
  setIsOpen: (open: boolean) => void; // Must be controlled by parent
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ stats, onWithdraw, isOpen, setIsOpen }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const maxWithdrawal = stats.currentBalance;

  const handleWithdraw = () => {
    if (typeof amount === 'number' && amount > 0 && amount <= maxWithdrawal) {
      onWithdraw(amount);
      setIsOpen(false);
      setAmount('');
    } else {
      alert("Invalid amount or exceeds current balance.");
    }
  };

  const amountNumber = typeof amount === 'number' ? amount : 0;
  const isInvalid = amountNumber > maxWithdrawal;

  return (
    // Dialog is now controlled via isOpen/setIsOpen props
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Send className="h-6 w-6" /> Request Payout
          </DialogTitle>
          <DialogDescription>
            Transfer funds from your available balance to your linked bank account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Available Balance:</p>
            <p className="text-3xl font-extrabold text-green-600">${maxWithdrawal.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount" className="font-semibold">Amount to Withdraw</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
              placeholder="e.g., 500.00"
              className={cn("text-lg", isInvalid && "border-red-500")}
              step="0.01"
            />
            {isInvalid && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" /> Amount exceeds available balance.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleWithdraw} 
            disabled={!amountNumber || amountNumber <= 0 || isInvalid}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            Confirm Withdrawal (${amountNumber.toFixed(2)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
