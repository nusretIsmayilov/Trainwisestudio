import Stripe from 'stripe';

export function createStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  return new Stripe(stripeSecretKey);
}

export const PRICE_IDS = {
  usd: process.env.STRIPE_PRICE_USD!,
  nok: process.env.STRIPE_PRICE_NOK!,
  sek: process.env.STRIPE_PRICE_SEK!,
  dkk: process.env.STRIPE_PRICE_DKK!,
};

export function getAppUrl(): string {
  return process.env.PUBLIC_APP_URL || 'https://trainwisestudio.netlify.app';
}
