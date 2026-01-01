export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

export function createStripeClient(): Stripe {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });
}

export const PRICE_IDS = {
  usd: Deno.env.get('STRIPE_PRICE_USD') || '***REMOVED***',
  nok: Deno.env.get('STRIPE_PRICE_NOK') || '***REMOVED***',
  sek: Deno.env.get('STRIPE_PRICE_SEK') || '***REMOVED***',
  dkk: Deno.env.get('STRIPE_PRICE_DKK') || '***REMOVED***',
};

export function getAppUrl(): string {
  return Deno.env.get('PUBLIC_APP_URL') || 'https://trainwisestudio.com';
}


