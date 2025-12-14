import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, PRICE_IDS, getAppUrl, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const stripe = createStripeClient();
    const body = await req.json();
    const { priceKey, trialDays, stripeCustomerId, currency, userId } = body;

    console.log('[API] create-checkout-session', { priceKey, trialDays, hasCustomer: !!stripeCustomerId, currency, userId });
    
    // Log configured price IDs (first few chars only for security)
    const priceIdsPreview = Object.entries(PRICE_IDS).reduce((acc, [key, value]) => {
      acc[key] = value ? `${value.substring(0, 10)}... (length: ${value.length})` : 'NOT SET';
      return acc;
    }, {} as Record<string, string>);
    console.log('[API] Configured price IDs preview:', priceIdsPreview);

    let price: string;
    let missingVar: string;
    
    // Determine which price ID to use
    if (currency) {
      const currencyKey = currency.toLowerCase() as keyof typeof PRICE_IDS;
      const currencyPrice = PRICE_IDS[currencyKey];
      console.log('[API] Looking up price for currency:', { currency, currencyKey, hasPrice: !!currencyPrice, priceLength: currencyPrice?.length || 0 });
      
      if (currencyPrice && currencyPrice.length > 0) {
        // Validate that it's a proper Stripe price ID
        if (!currencyPrice.startsWith('price_')) {
          console.error('[API] Invalid price ID format:', { 
            currency, 
            valuePreview: currencyPrice.substring(0, 20),
            startsWith: currencyPrice.substring(0, 5)
          });
          return new Response(JSON.stringify({
            error: 'Invalid Stripe price ID format',
            details: `The value in STRIPE_PRICE_${currency.toUpperCase()} is not a valid Stripe price ID. Price IDs must start with "price_".`,
            hint: 'In Stripe Dashboard, go to Products > Your Product > Pricing to find the Price ID (starts with price_), not the Product ID (starts with prod_)',
            valuePreview: currencyPrice.substring(0, 20) + '...'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        price = currencyPrice;
        console.log('[API] Using price ID:', { currency, pricePreview: `${price.substring(0, 20)}...` });
      } else {
        // Currency provided but price ID not configured
        missingVar = `STRIPE_PRICE_${currency.toUpperCase()}`;
        console.error('[API] Price ID not configured for currency:', { currency, missingVar });
        return new Response(JSON.stringify({
          error: 'Stripe price ID not configured',
          details: `The required Stripe price ID is not set. Please configure ${missingVar} environment variable with a valid Stripe price ID (starting with price_).`,
          currency: currency,
          hint: 'Make sure the environment variable is set in your Supabase project settings and the value starts with "price_"'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // No currency provided, use priceKey mapping
      const priceMap: Record<string, string> = {
        platform_monthly: PRICE_IDS.usd || '',
      };
      price = priceMap[priceKey] || '';
      
      // If priceKey doesn't map to a configured price, check if priceKey itself is a valid price ID
      if (!price || price.length === 0) {
        // If priceKey looks like a price ID (starts with price_), use it directly
        if (priceKey && priceKey.startsWith('price_')) {
          price = priceKey;
        } else {
          missingVar = priceKey === 'platform_monthly' ? 'STRIPE_PRICE_USD' : 'Stripe price ID';
          return new Response(JSON.stringify({
            error: 'Stripe price ID not configured',
            details: `The required Stripe price ID is not set. Please configure ${missingVar} environment variable with a valid Stripe price ID (starting with price_).`,
            priceKey: priceKey
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }
    
    // Validate price ID format
    if (!price || price.startsWith('prod_') || price.includes('REMOVED') || price.includes('***') || price.length === 0) {
      missingVar = currency 
        ? `STRIPE_PRICE_${currency.toUpperCase()}`
        : priceKey === 'platform_monthly' 
          ? 'STRIPE_PRICE_USD'
          : 'Stripe price ID';
      
      return new Response(JSON.stringify({
        error: 'Invalid Stripe price ID',
        details: `The price ID is invalid or not configured. Please configure ${missingVar} environment variable with a valid Stripe price ID (starting with price_).`,
        currency: currency || 'usd',
        priceKey: priceKey || 'platform_monthly'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate that the price exists in Stripe
    try {
      await stripe.prices.retrieve(price);
    } catch (priceError: any) {
      console.error('[API] Price validation failed', { price, error: priceError.message });
      return new Response(JSON.stringify({
        error: 'Stripe price not found',
        details: `The price ID "${price}" does not exist in your Stripe account. Please verify your Stripe price IDs are correct.`,
        priceId: price
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId || undefined,
      payment_method_types: ['card'],
      line_items: [
        { price, quantity: 1 }
      ],
      allow_promotion_codes: true,
      subscription_data: trialDays && trialDays > 0 ? { trial_period_days: trialDays } : undefined,
      client_reference_id: userId,
      success_url: `${appUrl}/customer/settings?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/customer/settings?status=cancel`,
    });
    
    console.log('[API] Checkout session created', { sessionId: session.id, url: session.url });
    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[API] create-checkout-session error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to create checkout session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

