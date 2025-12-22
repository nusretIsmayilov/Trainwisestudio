import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { createCheckoutSession, syncCheckoutSession, cancelSubscriptionAtPeriodEnd, resumeSubscription, openCustomerPortal, cancelSubscriptionNow, gracefulCancelPlan } from '@/lib/stripe/api';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { usePaymentInfo } from '@/hooks/usePaymentInfo';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PaymentAndLegal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, refreshProfile } = useAuth();
  const { refreshAll } = useRefresh();
  const { paymentInfo, loading: paymentLoading } = usePaymentInfo();
  const { detectedCurrency, getCurrencyOption } = useCurrencyDetection();
  const [selectedCurrency, setSelectedCurrency] = useState(detectedCurrency);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });
  const [portalLoading, setPortalLoading] = useState(false);
  const { t } = useTranslation();

  // Update selected currency when detected currency changes
  useEffect(() => {
    setSelectedCurrency(detectedCurrency);
  }, [detectedCurrency]);

  const handlePasswordChange = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });
      if (error) {
        throw error;
      }
      toast.success("Password successfully updated!");
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err?.message || 'Failed to update password.');
    }
  };

  const handleSubscribe = async () => {
    try {
      const { checkoutUrl } = await createCheckoutSession({
        priceKey: 'platform_monthly',
        trialDays: 7,
        stripeCustomerId: profile?.stripe_customer_id ?? null,
        currency: selectedCurrency,
        userId: profile?.id,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      alert('Failed to create checkout session. Please try again.');
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error?.message || 'Failed to start subscription process. Please try again.');
    }
  };

  const handleCancelAtPeriodEnd = async () => {
    try {
      if (!profile?.id) return;
      await gracefulCancelPlan(profile.id);
      toast.success('Subscription marked as canceled.');
      await refreshAll();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to cancel');
    }
  };

  const handleCancelNow = async () => {
    try {
      if (!profile?.id) return;
      await gracefulCancelPlan(profile.id);
      toast.success('Subscription canceled.');
      await refreshAll();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to cancel');
    }
  };

  const handleResume = async () => {
    try {
      if (!profile?.stripe_subscription_id) {
        toast.error('No active subscription found.');
        return;
      }
      const res = await resumeSubscription(profile.stripe_subscription_id);
      if (res?.success) {
        toast.success('Your subscription has been resumed.');
        await refreshAll();
      } else {
        toast.error(res?.error || 'Failed to resume subscription');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to resume subscription');
    }
  };

  const handleOpenCustomerPortal = async () => {
    if (portalLoading) return;
    try {
      if (!profile?.stripe_customer_id) {
        toast.error('No billing profile found. Please contact support.');
        return;
      }
      setPortalLoading(true);
      const { url } = await openCustomerPortal(profile.stripe_customer_id, `${window.location.origin}/customer/settings`);
      if (url) {
        window.location.href = url;
      }
    } catch (e: any) {
      console.error('Billing portal error:', e);
      toast.error(e?.message || 'Failed to open billing portal. Please try again later.');
    } finally {
      setPortalLoading(false);
    }
  };

  // After redirect from Stripe success, sync immediately then refresh
  const params = new URLSearchParams(location.search);
  const status = params.get('status');
  const sessionId = params.get('session_id');
  const hasRunRef = useRef(false);

useEffect(() => {
  if (hasRunRef.current) return;
  if (status !== 'success' || !sessionId) return;

  hasRunRef.current = true;

  syncCheckoutSession(sessionId)
    .then((data) => {
      if (data?.ok) {
        alert('Subscription activated successfully.');
      }
      window.location.replace('/customer/settings');
    });
}, [status, sessionId]);
  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">{t('profile.settingsLegal')}</h3>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-medium">Payment & Subscription</AccordionTrigger>
            <AccordionContent className="p-4 space-y-6">
              {paymentLoading ? (
                <div className="text-center py-4">Loading payment information...</div>
              ) : paymentInfo ? (
                <>
                  <div className="space-y-2 text-sm">
                    <p><strong>Current Plan:</strong> {paymentInfo.currentPlan.name}</p>
                    <p><strong>Price:</strong> {paymentInfo.currentPlan.price}</p>
                    {paymentInfo.currentPlan.billingCycle && (
                      <p><strong>Billing Cycle:</strong> {paymentInfo.currentPlan.billingCycle}</p>
                    )}
                    {paymentInfo.currentPlan.showNextBilling && paymentInfo.currentPlan.nextBillingDate && (
                      <p><strong>Next Billing:</strong> {paymentInfo.currentPlan.nextBillingDate}</p>
                    )}
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`capitalize ${
                          paymentInfo.currentPlan.status === 'active'
                            ? 'text-green-600'
                            : paymentInfo.currentPlan.status === 'trialing'
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {paymentInfo.currentPlan.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  {paymentInfo.paymentMethod && paymentInfo.currentPlan.type === 'subscription' ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Card:</strong> {paymentInfo.paymentMethod.brand} ending in {paymentInfo.paymentMethod.last4}</p>
                      <p><strong>Expires:</strong> {paymentInfo.paymentMethod.expiry}</p>
                    </div>
                  ) : paymentInfo.currentPlan.type === 'subscription' ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>No payment method on file</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No payment information available</div>
              )}
                {/* Payment method updates are managed in Stripe Billing Portal */}
              <div className="space-y-4">
                {/* Currency is auto-detected; selector hidden */}
                <div className="space-y-2 text-sm">
                  {paymentInfo?.currentPlan?.type === 'subscription' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleOpenCustomerPortal}
                        disabled={portalLoading}
                      >
                        {portalLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Opening Portal...
                          </>
                        ) : (
                          'Manage Billing'
                        )}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="ml-2"
                        onClick={handleCancelAtPeriodEnd}
                      >
                        Cancel Subscription
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="ml-2"
                        onClick={handleCancelNow}
                      >
                        Cancel Now
                      </Button>
                    </>
                  ) : paymentInfo?.currentPlan?.type === 'coach' ? (
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      Billing is handled directly with your coach. Reach out to them to make changes.
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleSubscribe}
                    >
                      Subscribe {getCurrencyOption(selectedCurrency).price}/mo (7-day trial)
                    </Button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-medium">Account Security</AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-5 w-5" />
                    <h4 className="font-medium">Change Password</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="current-password"
                          type={passwordVisibility.current ? 'text' : 'password'} 
                          placeholder="Enter current password" 
                          value={passwordForm.current} 
                          onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        >
                          {passwordVisibility.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="new-password"
                          type={passwordVisibility.new ? 'text' : 'password'} 
                          placeholder="Enter new password" 
                          value={passwordForm.new} 
                          onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        >
                          {passwordVisibility.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password"
                          type={passwordVisibility.confirm ? 'text' : 'password'} 
                          placeholder="Confirm new password" 
                          value={passwordForm.confirm} 
                          onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        >
                          {passwordVisibility.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePasswordChange} 
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium">Privacy Policy & Terms</AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Learn how we protect and use your data
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/privacy')}
                  >
                    Read Policy
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Terms of Service</h4>
                    <p className="text-sm text-muted-foreground">
                      Review our terms and conditions
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/terms')}
                  >
                    Read Terms
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default PaymentAndLegal;
