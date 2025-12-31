import Stripe from 'stripe';

/* =======================
   CORS
======================= */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

/**
 * Express / Vercel için CORS handler
 */
export function handleCors(req: any, res: any): boolean {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return true;
  }
  return false;
}

/* =======================
   STRIPE
======================= */

export function createStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  // apiVersion yok → Stripe account default (TS hatası yok)
  return new Stripe(stripeSecretKey);
}

/* =======================
   PRICE IDS
======================= */

/**
 * ENV’den price ID okur
 */
function getPriceId(key: string): string {
  const envKey = `STRIPE_PRICE_${key.toUpperCase()}`;
  const value = process.env[envKey] || '';

  if (value) {
    console.log(
      `[Config] ${envKey}: ${value.substring(0, 20)}... (from environment variable)`
    );
  } else {
    console.log(`[Config] ${envKey}: Using hardcoded default`);
  }

  return value;
}

/**
 * Default price ID’ler
 * (ENV ile override edilebilir)
 */
const DEFAULT_PRICE_IDS = {
  usd: 'price_1RuGa5ASxfWk5jq3tVdquNfV',
  eur: '', // ENV zorunlu
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

/**
 * Price ID’ler doğru set edilmiş mi?
 */
export function arePriceIdsConfigured(): boolean {
  return Object.values(PRICE_IDS).every(
    price => price && price.length > 0 && !price.includes('REMOVED')
  );
}

/* =======================
   APP URL
======================= */

export function getAppUrl(): string {
  return process.env.PUBLIC_APP_URL || 'https://trainwisestudio.netlify.app';
}
