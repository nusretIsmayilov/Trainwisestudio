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

// Helper to get price ID with logging (returns empty string if not set, allowing fallback to defaults)
function getPriceId(key: string): string {
  const envKey = `STRIPE_PRICE_${key.toUpperCase()}`;
  const value = Deno.env.get(envKey) || '';
  
  if (value) {
    console.log(`[Config] ${envKey}: ${value.substring(0, 20)}... (from environment variable)`);
  } else {
    console.log(`[Config] ${envKey}: Using hardcoded default`);
  }
  return value;
}

// Default price IDs (can be overridden by environment variables)
const DEFAULT_PRICE_IDS = {
  usd: 'price_1RuGa5ASxfWk5jq3tVdquNfV',
  eur: '', // No default, must be set via STRIPE_PRICE_EUR
  nok: 'price_1RuGbJASxfWk5jq3jHf2UWtW',
  sek: 'price_1RuGboASxfWk5jq387nsCumM',
  dkk: 'price_1RuGcJASxfWk5jq3tY106Hk9',
};

export const PRICE_IDS = {
  usd: getPriceId('USD') || DEFAULT_PRICE_IDS.usd,
  eur: getPriceId('EUR') || DEFAULT_PRICE_IDS.eur,
  nok: getPriceId('NOK') || DEFAULT_PRICE_IDS.nok,
  sek: getPriceId('SEK') || DEFAULT_PRICE_IDS.sek,
  dkk: getPriceId('DKK') || DEFAULT_PRICE_IDS.dkk,
};

// Helper to check if price IDs are configured
export function arePriceIdsConfigured(): boolean {
  return Object.values(PRICE_IDS).every(price => price && price.length > 0 && !price.includes('REMOVED'));
}

export function getAppUrl(): string {
  return Deno.env.get('PUBLIC_APP_URL') || 'https://trainwisestudio-two.vercel.app';
}


