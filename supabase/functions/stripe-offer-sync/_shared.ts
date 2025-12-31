import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
   SUPABASE
======================= */

export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/* =======================
   STRIPE
======================= */

export function createStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  // apiVersion bilerek yok → Stripe hesabının default API version’ı kullanılır
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
