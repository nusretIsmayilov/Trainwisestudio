'use client';

import React from 'react';
import { Transaction } from '@/mockdata/income/mockIncome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {t('income.recentActivity')} 🕒
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx) => {
          const isDeposit = tx.type === 'Contract Payment';
          const Icon = isDeposit ? TrendingUp : TrendingDown;
          const statusColor = tx.status === 'Completed' ? 'text-green-500' : tx.status === 'Pending' ? 'text-orange-500' : 'text-red-500';

          return (
            <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-3 rounded-full",
                  isDeposit ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                )}>
                  <Icon className={cn("h-5 w-5", isDeposit ? 'text-green-600' : 'text-red-600')} />
                </div>
                <div>
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.clientName ? `From: ${tx.clientName}` : 'System Transaction'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-bold text-lg", isDeposit ? 'text-green-600' : 'text-foreground')}>
                  {isDeposit ? '+' : '-'} ${Math.abs(tx.amount).toFixed(2)}
                </p>
                <p className={cn("text-xs font-semibold", statusColor)}>
                  {tx.status} • {new Date(tx.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
