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
 * Express / Vercel uyumlu CORS handler
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

  // apiVersion bilerek yok → Stripe default API version
  return new Stripe(stripeSecretKey);
}

/* =======================
   PRICE IDS
======================= */

export const PRICE_IDS = {
  usd: process.env.STRIPE_PRICE_USD || '***REMOVED***',
  nok: process.env.STRIPE_PRICE_NOK || '***REMOVED***',
  sek: process.env.STRIPE_PRICE_SEK || '***REMOVED***',
  dkk: process.env.STRIPE_PRICE_DKK || '***REMOVED***',
};

/* =======================
   APP URL
======================= */

export function getAppUrl(): string {
  return process.env.PUBLIC_APP_URL || 'https://trainwisestudio.netlify.app';
}
