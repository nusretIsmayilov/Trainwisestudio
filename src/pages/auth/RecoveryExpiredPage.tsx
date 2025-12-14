'use client';

import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AuthCard } from '@/components/shared/AuthCard';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const RecoveryExpiredPage = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Reset Link Expired</h1>
          <p className="text-muted-foreground">
            Your password reset link has expired or is invalid. Request a new link to continue.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/forgot-password')} className="w-full">
              Request New Reset Link
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default RecoveryExpiredPage;


