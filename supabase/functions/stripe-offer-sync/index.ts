import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = createStripeClient();
    const supabase = createSupabaseClient(req);

    console.log('[API] stripe-offer-sync invoked', { sessionId });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      console.warn('[API] stripe-offer-sync session not found', { sessionId });
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session.mode !== 'payment') {
      console.warn('[API] stripe-offer-sync session not payment mode', { sessionId, mode: session.mode });
      return new Response(JSON.stringify({ error: 'Session is not a one-time payment' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientRef = (session.client_reference_id as string) || '';
    if (!clientRef.startsWith('offer:')) {
      console.warn('[API] stripe-offer-sync invalid client_reference_id', { sessionId, client_reference_id: clientRef });
      return new Response(JSON.stringify({ error: 'Session is not linked to an offer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const offerId = clientRef.replace('offer:', '');
    const { data: offerRows, error: offerErr } = await supabase
      .from('coach_offers')
      .select('*')
      .eq('id', offerId)
      .limit(1);

    if (offerErr) {
      console.error('[API] stripe-offer-sync error fetching offer', { offerId, error: offerErr });
      throw offerErr;
    }

    const offer = offerRows?.[0];
    if (!offer) {
      console.warn('[API] stripe-offer-sync offer not found', { offerId });
      return new Response(JSON.stringify({ error: 'Offer not found', offerId }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let statusChanged = false;

    if (offer.status !== 'accepted') {
      console.log('[API] stripe-offer-sync updating offer status to accepted', { offerId });
      const { error: updateOfferError } = await supabase
        .from('coach_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (updateOfferError) {
        console.error('[API] stripe-offer-sync failed to update offer status', { offerId, error: updateOfferError });
        throw updateOfferError;
      }

      statusChanged = true;

      const weeks = offer.duration_months || 1;
      const expiry = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
      console.log('[API] stripe-offer-sync updating profile', {
        customerId: offer.customer_id,
        coachId: offer.coach_id,
        plan: `${weeks}-week plan`,
        plan_expiry: expiry,
      });
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          coach_id: offer.coach_id,
          plan: `${weeks}-week plan`,
          plan_expiry: expiry,
        })
        .eq('id', offer.customer_id);

      if (profileError) {
        console.error('[API] stripe-offer-sync failed to update profile', { customerId: offer.customer_id, error: profileError });
        throw profileError;
      }

      const amountCents = Math.round(Number(offer.price) * 100);
      const platformFee = Math.round(amountCents * 0.15);
      const netAmount = amountCents - platformFee;

      console.log('[API] stripe-offer-sync creating payout', {
        coachId: offer.coach_id,
        amountCents,
        platformFee,
        netAmount,
      });
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          coach_id: offer.coach_id,
          amount_cents: amountCents,
          platform_fee_cents: platformFee,
          net_amount_cents: netAmount,
          status: 'pending',
          period_start: new Date().toISOString().slice(0, 10),
          period_end: new Date().toISOString().slice(0, 10),
        });

      if (payoutError) {
        console.error('[API] stripe-offer-sync failed to create payout', { coachId: offer.coach_id, error: payoutError });
        throw payoutError;
      }

      try {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

        const { data: existingContract } = await supabase
          .from('contracts')
          .select('id')
          .eq('offer_id', offer.id)
          .maybeSingle();

        if (!existingContract) {
          const { error: contractError } = await supabase
            .from('contracts')
            .insert({
              coach_id: offer.coach_id,
              customer_id: offer.customer_id,
              offer_id: offer.id,
              status: 'active',
              start_date: startDate.toISOString().slice(0, 10),
              end_date: endDate.toISOString().slice(0, 10),
              price_cents: amountCents,
            });

          if (contractError) {
            console.warn('[API] stripe-offer-sync failed to create contract', { offerId, error: contractError });
          }
        }
      } catch (contractErr) {
        console.warn('[API] stripe-offer-sync contract handling error', { offerId, error: contractErr });
      }

      try {
        const { data: convo, error: convoError } = await supabase
          .from('conversations')
          .select('id')
          .eq('coach_id', offer.coach_id)
          .eq('customer_id', offer.customer_id)
          .maybeSingle();

        if (convoError) {
          console.error('[API] stripe-offer-sync failed to fetch conversation', { error: convoError });
        }

        let conversationId = convo?.id as string | undefined;
        if (!conversationId) {
          const { data: created, error: createConvoError } = await supabase
            .from('conversations')
            .insert({ coach_id: offer.coach_id, customer_id: offer.customer_id, title: 'Coaching Contract' })
            .select('id')
            .single();

          if (createConvoError) {
            console.error('[API] stripe-offer-sync failed to create conversation', { error: createConvoError });
          } else {
            conversationId = created?.id;
          }
        }

        if (conversationId) {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: offer.coach_id,
              content: `✅ Your coaching plan is now active for ${offer.duration_months || 1} week(s). Let's get started!`,
              message_type: 'system',
            });

          if (messageError) {
            console.error('[API] stripe-offer-sync failed to create system message', { error: messageError });
          }
        }
      } catch (chatErr) {
        console.warn('[API] stripe-offer-sync conversation/message error', { error: chatErr });
      }
    }

    console.log('[API] stripe-offer-sync completed', { offerId, status: 'accepted', statusChanged });
    return new Response(JSON.stringify({
      offerId,
      status: 'accepted',
      statusChanged,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[API] stripe-offer-sync error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to sync offer checkout' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


