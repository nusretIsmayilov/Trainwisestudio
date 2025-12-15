import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, getAppUrl, createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

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
    const supabase = createSupabaseClient(req);
    const body = await req.json();
    const { offerId, appUrl: customAppUrl } = body;

    if (!offerId) {
      return new Response(JSON.stringify({ error: 'offerId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: offers, error } = await supabase
      .from('coach_offers')
      .select('id, price, duration_months, coach_id, customer_id')
      .eq('id', offerId)
      .limit(1);
    
    if (error || !offers?.[0]) {
      return new Response(JSON.stringify({ error: 'Offer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const offer = offers[0];
    const amountCents = Math.round(Number(offer.price) * 100);
    if (!amountCents || amountCents <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid offer amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const weeks = offer.duration_months || 1;
    const appUrl = (typeof customAppUrl === 'string' && customAppUrl.length > 0)
      ? customAppUrl
      : getAppUrl();
    
    const successUrl = `${appUrl}/customer/messages?offer_status=paid&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/customer/messages?offer_status=cancel`;
    
    console.log('[API] Creating offer checkout session', { 
      offerId, 
      amountCents, 
      weeks, 
      appUrl,
      successUrl,
      cancelUrl,
      client_reference_id: `offer:${offer.id}`
    });
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Coach Offer',
              description: `${weeks}-week coaching package`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      client_reference_id: `offer:${offer.id}`,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    console.log('[API] Created offer checkout session', { 
      offerId, 
      amountCents, 
      weeks, 
      sessionId: session.id,
      checkoutUrl: session.url,
      successUrl: session.success_url,
      cancelUrl: session.cancel_url
    });
    return new Response(JSON.stringify({ 
      checkoutUrl: session.url,
      sessionId: session.id  // Include session ID in response for easy access
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[API] create-offer-checkout error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to create offer checkout session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

