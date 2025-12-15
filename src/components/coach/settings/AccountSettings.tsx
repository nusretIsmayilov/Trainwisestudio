'use client';

import React, { useState } from 'react';
import { CoachAccount } from '@/mockdata/settings/mockSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Lock, Globe, DollarSign, Save, CreditCard, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AccountSettingsProps {
  account: CoachAccount;
  onUpdate: (updatedAccount: CoachAccount) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ account, onUpdate }) => {
  const [formData, setFormData] = useState(account);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const { t } = useTranslation();
  const [payoutForm, setPayoutForm] = useState({
    method: 'paypal' as 'paypal' | 'stripe',
    paypalEmail: '',
    paypalAccountId: '',
    stripeAccount: ''
  });
  const [isUpdatingPayout, setIsUpdatingPayout] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const handlePasswordChange = (e: React.MouseEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    // Simulate API call for password change
    toast.success("Password successfully updated!");
    setPasswordForm({ current: '', new: '', confirm: '' });
  };
  
  const handleSave = () => {
    onUpdate(formData);
    toast.success('Account Information Updated!');
  };

  const handlePayoutUpdate = async () => {
    setIsUpdatingPayout(true);
    try {
      const { config } = await import('@/lib/config');
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'apikey': config.supabase.anonKey,
      };

      const response = await fetch(`${config.api.baseUrl}/coach-payouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update-settings',
          coachId: formData.id,
          payoutMethod: payoutForm.method,
          bankDetails: null,
          paypalEmail: payoutForm.method === 'paypal' ? payoutForm.paypalEmail : null,
          paypalAccountId: payoutForm.method === 'paypal' ? payoutForm.paypalAccountId || null : null,
          stripeAccountId: payoutForm.method === 'stripe' ? payoutForm.stripeAccount : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payout method');
      }

      const data = await response.json();
      const updatedAccount = {
        ...formData,
        payoutMethod: payoutForm.method,
        payoutDetails: payoutForm.method === 'paypal'
          ? payoutForm.paypalEmail
          : payoutForm.stripeAccount
      };
      
      onUpdate(updatedAccount);
      setFormData(updatedAccount);
      setIsPayoutModalOpen(false);
      toast.success('Payout method updated successfully!');
    } catch (error) {
      console.error('Error updating payout method:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update payout method. Please try again.');
    } finally {
      setIsUpdatingPayout(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Contact Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5" /> Private Contact Info
          </CardTitle>
          <CardDescription>Your email and phone number (kept private).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5" /> Payout Details
          </CardTitle>
          <CardDescription>Where we send your earnings (secure).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payout Method</Label>
            <div className="flex items-center gap-2">
              {formData.payoutMethod === 'paypal' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
              {formData.payoutMethod === 'stripe' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
              <Input readOnly value={formData.payoutMethod.charAt(0).toUpperCase() + formData.payoutMethod.slice(1)} />
            </div>
            <p className="text-sm text-muted-foreground">Current Details: {formData.payoutDetails}</p>
          </div>
          
          <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Update Payout Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Update Payout Method</DialogTitle>
                <DialogDescription>
                  Choose how you'd like to receive your earnings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Payout Method</Label>
                  <Select 
                    value={payoutForm.method} 
                    onValueChange={(value: 'paypal' | 'stripe') => 
                      setPayoutForm({ ...payoutForm, method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payoutForm.method === 'paypal' && (
                  <div className="space-y-3">
                  <div>
                    <Label>PayPal Email</Label>
                    <Input 
                      value={payoutForm.paypalEmail}
                      onChange={(e) => setPayoutForm({ ...payoutForm, paypalEmail: e.target.value })}
                      placeholder="your-email@example.com"
                      type="email"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Make sure this email is verified in your PayPal account
                      </p>
                    </div>
                    <div>
                      <Label>PayPal Account ID (Optional)</Label>
                      <Input 
                        value={payoutForm.paypalAccountId}
                        onChange={(e) => setPayoutForm({ ...payoutForm, paypalAccountId: e.target.value })}
                        placeholder="PayPal Merchant ID or Account ID"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        For business accounts, you can provide your PayPal Merchant ID
                      </p>
                    </div>
                  </div>
                )}

                {payoutForm.method === 'stripe' && (
                  <div>
                    <Label>Stripe Account ID</Label>
                    <Input 
                      value={payoutForm.stripeAccount}
                      onChange={(e) => setPayoutForm({ ...payoutForm, stripeAccount: e.target.value })}
                      placeholder="acct_1234567890"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayoutUpdate}
                    disabled={isUpdatingPayout}
                    className="flex-1"
                  >
                    {isUpdatingPayout ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Method'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {/* Password and Security */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5" /> {t('settings.changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder={t('auth.currentPassword')} value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          <Input type="password" placeholder={t('auth.newPassword')} value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} />
          <Input type="password" placeholder={t('auth.confirmPassword')} value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          <Button onClick={handlePasswordChange} className="w-full bg-red-600 hover:bg-red-700">
            {t('settings.updatePassword')}
          </Button>
        </CardContent>
      </Card>
      
      {/* Preferences */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" /> {t('settings.preferences')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>{t('settings.preferredLanguage')}</Label>
          <Select 
            value={formData.preferredLanguage} 
            onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value as 'English' | 'Spanish' | 'German' })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('language.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">{t('language.english')}</SelectItem>
              <SelectItem value="Spanish">{t('language.spanish')}</SelectItem>
              <SelectItem value="German">{t('language.german')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-5 w-5" /> Save Account Settings
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;
