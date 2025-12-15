import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCoachPayoutSettings } from '@/hooks/useCoachPayoutSettings';
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PayoutSettings = () => {
  const { settings, balance, loading, error, updateSettings, requestPayout } = useCoachPayoutSettings();
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const handleUpdateSettings = async (formData: any) => {
    const success = await updateSettings(formData);
    if (success) {
      toast.success('Payout settings updated successfully');
    } else {
      toast.error('Failed to update payout settings');
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!balance || amount > balance.availableBalance / 100) {
      toast.error('Insufficient available balance');
      return;
    }

    setIsRequestingPayout(true);
    const success = await requestPayout(Math.round(amount * 100));
    if (success) {
      toast.success('Payout request submitted successfully');
      setPayoutAmount('');
    } else {
      toast.error('Failed to request payout');
    }
    setIsRequestingPayout(false);
  };

  if (loading && !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      {balance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${(balance.totalEarnings / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${(balance.availableBalance / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${(balance.pendingAmount / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Pending Payouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Request */}
      {balance && balance.availableBalance > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="payoutAmount">Amount (USD)</Label>
                <Input
                  id="payoutAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance.availableBalance / 100}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleRequestPayout}
                  disabled={isRequestingPayout || !payoutAmount}
                  className="min-w-[120px]"
                >
                  {isRequestingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Available balance: ${(balance.availableBalance / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payout Method Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paypal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paypal" className="space-y-4">
              <PayPalForm 
                settings={settings} 
                onUpdate={handleUpdateSettings}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="stripe" className="space-y-4">
              <StripeForm 
                settings={settings} 
                onUpdate={handleUpdateSettings}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
};

const PayPalForm = ({ settings, onUpdate, loading }: any) => {
  const [email, setEmail] = useState(settings?.paypal_email || '');
  const [accountId, setAccountId] = useState(settings?.paypal_account_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      payout_method: 'paypal',
      paypal_email: email,
      paypal_account_id: accountId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="paypal_email">PayPal Email</Label>
        <Input
          id="paypal_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Make sure this email is verified in your PayPal account
        </p>
      </div>
      <div>
        <Label htmlFor="paypal_account_id">PayPal Account ID (Optional)</Label>
        <Input
          id="paypal_account_id"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="PayPal Merchant ID or Account ID"
        />
        <p className="text-xs text-muted-foreground mt-1">
          For business accounts, you can provide your PayPal Merchant ID
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save PayPal Settings'}
      </Button>
    </form>
  );
};

const StripeForm = ({ settings, onUpdate, loading }: any) => {
  const [accountId, setAccountId] = useState(settings?.stripe_account_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      payout_method: 'stripe',
      stripe_account_id: accountId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="stripe_account_id">Stripe Account ID</Label>
        <Input
          id="stripe_account_id"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Stripe Account'}
      </Button>
    </form>
  );
};
