import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface AuthCardProps {
  className?: string;
  children: React.ReactNode;
}

// The AuthCard is now a simple, reusable wrapper.
// It no longer controls the page layout.
export const AuthCard = ({ className, children }: AuthCardProps) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className={cn('p-6 sm:p-8 border-none lg:border shadow-none lg:shadow-lg', className)}>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;
