import { config } from '@/lib/config';
import { supabase } from '@/integrations/supabase/client';

// Helper to get auth headers for Supabase Edge Functions
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': config.supabase.anonKey,
  };
}

async function postToFunction<T>(functionName: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${config.api.baseUrl}/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  
  const data = await response.json() as T;
  
  // Log session ID to console if present (for offer checkout)
  if (functionName === 'stripe-offer-checkout' && (data as any).sessionId) {
    const sessionId = (data as any).sessionId;
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 STRIPE SESSION ID (Copy this for testing):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(sessionId);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Use this command to test:');
    console.log(`  .\\test-curl.ps1 -SessionId "${sessionId}" -AnonKey "YOUR_KEY"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n');
  }
  
  return data;
}

async function getFromFunction<T>(functionName: string, params?: Record<string, string>): Promise<T> {
  const headers = await getAuthHeaders();
  const url = new URL(`${config.api.baseUrl}/${functionName}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const fullUrl = url.toString();
  console.log(`[API] Calling Edge Function: ${functionName}`, {
    url: fullUrl,
    params,
    hasAuth: !!headers.Authorization
  });
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });
    
    console.log(`[API] Edge Function ${functionName} response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`[API] Edge Function ${functionName} error:`, {
        status: response.status,
        error: text
      });
      throw new Error(text || `Request failed: ${response.status}`);
    }
    
    const data = await response.json() as T;
    console.log(`[API] Edge Function ${functionName} success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Edge Function ${functionName} exception:`, error);
    throw error;
  }
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId?: string;
}

export async function createCheckoutSession(params: {
  priceKey: string;
  trialDays?: number;
  stripeCustomerId?: string | null;
  currency?: string;
  userId?: string;
}): Promise<CheckoutSessionResponse> {
  return await postToFunction<CheckoutSessionResponse>('stripe-checkout', params);
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId?: string, stripeCustomerId?: string): Promise<{ success: boolean; current_period_end?: number; error?: string }> {
  return await postToFunction('stripe-subscription', { action: 'cancel-at-period-end', subscriptionId, stripeCustomerId });
}

export async function resumeSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
  return await postToFunction('stripe-subscription', { action: 'resume', subscriptionId });
}

export async function syncCheckoutSession(sessionId: string): Promise<{ ok?: boolean; error?: string; plan_expiry?: number; user_id?: string; offerId?: string; status?: string; statusChanged?: boolean }> {
  return await getFromFunction('stripe-sync', { session_id: sessionId });
}

export async function createOfferCheckoutSession(offerId: string, appUrl?: string): Promise<CheckoutSessionResponse> {
  return await postToFunction<CheckoutSessionResponse>('stripe-offer-checkout', { offerId, appUrl });
}

export async function openCustomerPortal(stripeCustomerId: string, returnUrl?: string): Promise<{ url: string }> {
  return await postToFunction('stripe-customer-portal', { stripeCustomerId, returnUrl });
}

export async function cancelSubscriptionNow(subscriptionId?: string, userId?: string, stripeCustomerId?: string): Promise<{ success: boolean; canceled_at?: number; error?: string }> {
  return await postToFunction('stripe-subscription', { action: 'cancel-now', subscriptionId, userId, stripeCustomerId });
}

export async function gracefulCancelPlan(userId: string): Promise<{ success?: boolean; error?: string }> {
  return await postToFunction('stripe-subscription', { action: 'cancel-graceful', userId });
}


