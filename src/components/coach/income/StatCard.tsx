'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DollarSign, Clock, ArrowUp, Wallet } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  unit?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, unit = '$', className }) => {
  const formattedValue = `${unit}${value.toFixed(2)}`;
  
  // Dynamic color for primary stats
  const isPositive = value >= 0;
  const valueColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <Card className={cn("shadow-lg transition-transform hover:scale-[1.02] cursor-pointer", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueColor)}>{formattedValue}</div>
        {/* Placeholder for optional time comparison or detail */}
      </CardContent>
    </Card>
  );
};

export default StatCard;
