import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

type SupabaseServerClient = SupabaseClient<any, any, any>;

async function callSupabaseFunction(functionName: string, payload: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[AI] Function ${functionName} failed: ${text || response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

type OnboardingDetails = {
  goals?: string[];
  injuries?: string[];
  allergies?: string[];
  meditation_experience?: string | null;
  training_likes?: string[];
  training_dislikes?: string[];
};

type PersonalInsight = {
  id: string;
  title: string;
  text: string;
  emoji: string;
  type: 'positive' | 'warning';
};

type PersonalRecommendation = {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'general';
  emoji: string;
};

function buildInsightsFromOnboarding(details: OnboardingDetails): PersonalInsight[] {
  const insights: PersonalInsight[] = [];
  const goals = details.goals || [];
  const injuries = details.injuries || [];
  const likes = details.training_likes || [];
  const dislikes = details.training_dislikes || [];

  if (goals.length > 0) {
    insights.push({
      id: 'insight-goals',
      title: 'Goal Alignment',
      text: `We prioritized your top goal: ${goals[0]}. Expect schedules tuned around that outcome.`,
      emoji: '🎯',
      type: 'positive',
    });
  }

  if (injuries.length > 0) {
    insights.push({
      id: 'insight-injury',
      title: 'Injury Safeguards',
      text: `Movements were modified to protect your ${injuries[0]}. Recovery cues are baked in.`,
      emoji: '🛡️',
      type: 'warning',
    });
  }

  if (likes.length > 0) {
    insights.push({
      id: 'insight-favorites',
      title: 'Preferred Training',
      text: `Sessions lean into what you enjoy most: ${likes.slice(0, 2).join(', ')}.`,
      emoji: '⚡',
      type: 'positive',
    });
  }

  if (dislikes.length > 0) {
    insights.push({
      id: 'insight-dislikes',
      title: 'Avoiding Burnout',
      text: `We removed workouts you dislike (${dislikes.slice(0, 2).join(', ')}), keeping motivation high.`,
      emoji: '🧘',
      type: 'positive',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'insight-default',
      title: 'Personalized Kickoff',
      text: 'Your starter plan balances strength, recovery, and mindset habits to build momentum.',
      emoji: '✨',
      type: 'positive',
    });
  }

  return insights;
}

function buildRecommendationsFromOnboarding(details: OnboardingDetails): PersonalRecommendation[] {
  const recommendations: PersonalRecommendation[] = [];
  const goals = details.goals || [];
  const meditationExperience = (details.meditation_experience || '').toLowerCase();

  if (goals.some(goal => goal.toLowerCase().includes('sleep'))) {
    recommendations.push({
      id: 'rec-sleep',
      title: 'Wind-Down Ritual',
      description: 'Power down screens 30 minutes before bed and follow the guided breathing in your plan.',
      category: 'mental',
      emoji: '🌙',
    });
  }

  if (goals.some(goal => goal.toLowerCase().includes('muscle'))) {
    recommendations.push({
      id: 'rec-strength',
      title: 'Progressive Overload',
      description: 'Track two lifts weekly and add 2-5lbs whenever all reps feel controlled.',
      category: 'fitness',
      emoji: '💪',
    });
  }

  if (goals.some(goal => goal.toLowerCase().includes('nutrition'))) {
    recommendations.push({
      id: 'rec-nutrition',
      title: 'Protein Anchor',
      description: 'Aim for 25-35g of protein each meal. Grocery tips are ready inside your plan.',
      category: 'nutrition',
      emoji: '🥗',
    });
  }

  if (meditationExperience === 'beginner') {
    recommendations.push({
      id: 'rec-mindfulness',
      title: 'Micro Mindfulness',
      description: 'Start with 5-minute sessions right after workouts to lock in motivation.',
      category: 'mental',
      emoji: '🧠',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default',
      title: 'Stay Consistent',
      description: 'Follow the AI schedule for one full week, then log a check-in so we can adapt.',
      category: 'general',
      emoji: '📆',
    });
  }

  return recommendations;
}

async function ensureAIAutoPersonalization(supabase: SupabaseServerClient, userId: string) {
  try {
    const { data: personalization } = await supabase
      .from('ai_personalizations')
      .select('id, plans_generated')
      .eq('user_id', userId)
      .maybeSingle();

    if (personalization?.plans_generated) {
      console.log('[SYNC][AI] Personalization already exists, skipping generation', { userId });
      return;
    }

    const { data: existingPrograms } = await supabase
      .from('programs')
      .select('id')
      .eq('coach_id', userId)
      .eq('assigned_to', userId)
      .eq('is_ai_generated', true)
      .limit(1);

    if (!existingPrograms || existingPrograms.length === 0) {
      console.log('[SYNC][AI] Generating starter plans for user', { userId });
      await callSupabaseFunction('ai-generate-plans', { userId });
    } else {
      console.log('[SYNC][AI] AI programs already present for user', { userId });
    }

    const { data: onboardingDetails } = await supabase
      .from('onboarding_details')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const insights = buildInsightsFromOnboarding(onboardingDetails || {});
    const recommendations = buildRecommendationsFromOnboarding(onboardingDetails || {});
    const payload = {
      user_id: userId,
      analysis_type: 'subscription_onboarding',
      plans_generated: true,
      insights,
      recommendations,
      last_analysis_at: new Date().toISOString(),
    };

    if (personalization?.id) {
      await supabase
        .from('ai_personalizations')
        .update(payload)
        .eq('id', personalization.id);
    } else {
      await supabase.from('ai_personalizations').insert(payload);
    }
  } catch (error) {
    console.error('[SYNC][AI] Failed to auto-personalize subscriber', { userId, error });
  }
}

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
    console.log('[API] stripe-sync called', { 
      method: req.method, 
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    const stripe = createStripeClient();
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    console.log('[API] stripe-sync extracted session_id from URL', { sessionId, url: url.toString() });

    if (!sessionId) {
      console.error('[API] stripe-sync missing session_id');
      return new Response(JSON.stringify({ error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[API] stripe-sync retrieving Stripe session', { sessionId });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[API] /api/stripe/sync', {
      sessionId,
      customer: session.customer,
      subscription: session.subscription,
      client_reference_id: session.client_reference_id,
      mode: session.mode,
      payment_status: session.payment_status,
      status: session.status,
    });

    const clientRef = (session.client_reference_id as string) || '';
    console.log('[API] stripe-sync client_reference_id', { clientRef, mode: session.mode });
    
    // Handle coach offer payments (one-time payments)
    if (session.mode === 'payment' && clientRef.startsWith('offer:')) {
      const offerId = clientRef.replace('offer:', '');
      console.log('[API] stripe-sync processing offer payment', { offerId, sessionId, payment_status: session.payment_status });
      
      const { data: offerRows, error: offerErr } = await supabase
        .from('coach_offers')
        .select('*')
        .eq('id', offerId)
        .limit(1);
      
      if (offerErr) {
        console.error('[API] stripe-sync error fetching offer', { offerId, error: offerErr });
        return new Response(JSON.stringify({ error: 'Failed to fetch offer', offer_id: offerId, details: offerErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!offerRows?.[0]) {
        console.error('[API] stripe-sync offer not found', { offerId });
        return new Response(JSON.stringify({ error: 'Offer not found', offer_id: offerId }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const offer = offerRows[0];
      console.log('[API] stripe-sync offer found', { 
        offerId, 
        currentStatus: offer.status, 
        customerId: offer.customer_id, 
        coachId: offer.coach_id 
      });
      
      let statusChanged = false;
      
      if (offer.status !== 'accepted') {
        console.log('[API] stripe-sync updating offer status to accepted', { offerId });
        const { error: updateOfferError } = await supabase
          .from('coach_offers')
          .update({ status: 'accepted' })
          .eq('id', offerId);
        
        if (updateOfferError) {
          console.error('[API] stripe-sync failed to update offer status', { offerId, error: updateOfferError });
          return new Response(JSON.stringify({ 
            error: 'Failed to update offer status', 
            offer_id: offerId, 
            details: updateOfferError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log('[API] stripe-sync offer status updated successfully', { offerId });
        statusChanged = true;
        
        const weeks = offer.duration_months || 1;
        const expiry = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
        console.log('[API] stripe-sync updating profile', {
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
          console.error('[API] stripe-sync failed to update profile', { customerId: offer.customer_id, error: profileError });
          throw profileError;
        }
        
        const amountCents = Math.round(Number(offer.price) * 100);
        const platformFee = Math.round(amountCents * 0.15);
        const netAmount = amountCents - platformFee;
        
        console.log('[API] stripe-sync creating payout', {
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
          console.error('[API] stripe-sync failed to create payout', { coachId: offer.coach_id, error: payoutError });
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
              console.warn('[API] stripe-sync failed to create contract', { offerId, error: contractError });
            }
          }
        } catch (contractErr) {
          console.warn('[API] stripe-sync contract handling error', { offerId, error: contractErr });
        }
        
        try {
          const { data: convo, error: convoError } = await supabase
            .from('conversations')
            .select('id')
            .eq('coach_id', offer.coach_id)
            .eq('customer_id', offer.customer_id)
            .maybeSingle();
          
          if (convoError) {
            console.error('[API] stripe-sync failed to fetch conversation', { error: convoError });
          }
          
          let conversationId = convo?.id as string | undefined;
          if (!conversationId) {
            const { data: created, error: createConvoError } = await supabase
              .from('conversations')
              .insert({ coach_id: offer.coach_id, customer_id: offer.customer_id, title: 'Coaching Contract' })
              .select('id')
              .single();
            
            if (createConvoError) {
              console.error('[API] stripe-sync failed to create conversation', { error: createConvoError });
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
              console.error('[API] stripe-sync failed to create system message', { error: messageError });
            }
          }
        } catch (chatErr) {
          console.warn('[API] stripe-sync conversation/message error', { error: chatErr });
        }
      }
      
      console.log('[API] stripe-sync offer payment completed', { offerId, status: 'accepted', statusChanged });
      return new Response(JSON.stringify({
        ok: true,
        offerId,
        status: 'accepted',
        statusChanged,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle subscription payments (existing logic)
    // If we get here, it's not an offer payment, so it should be a subscription
    if (session.mode !== 'subscription') {
      console.warn('[API] stripe-sync unexpected session mode', { 
        mode: session.mode, 
        client_reference_id: clientRef,
        payment_status: session.payment_status,
        status: session.status
      });
    }
    
    if (!session.customer || !session.subscription) {
      console.error('[API] stripe-sync session missing customer or subscription', {
        hasCustomer: !!session.customer,
        hasSubscription: !!session.subscription,
        mode: session.mode,
        client_reference_id: clientRef
      });
      return new Response(JSON.stringify({ error: 'Session not completed or missing customer/subscription' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    let userId = (session.client_reference_id as string) || undefined;
    
    if (!userId) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', session.customer as string)
        .limit(1);
      userId = profiles?.[0]?.id;
    }

    if (userId) {
      console.log('[API] Sync updating profile', {
        userId,
        stripe_customer_id: session.customer,
        plan_expiry: subscription.current_period_end,
      });
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: (session.customer as string) ?? null,
          plan: 'platform_monthly',
          plan_expiry: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId);

      await ensureAIAutoPersonalization(supabase, userId);
      return new Response(JSON.stringify({ ok: true, plan_expiry: subscription.current_period_end, user_id: userId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.warn('[API] /api/stripe/sync could not resolve user from session', { sessionId, customer: session.customer, client_reference_id: session.client_reference_id });
    return new Response(JSON.stringify({ error: 'User not found for session', session_id: sessionId }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[API] /api/stripe/sync error', {
      error: e?.message || 'Unknown error',
      stack: e?.stack,
      name: e?.name,
      cause: e?.cause
    });
    return new Response(JSON.stringify({ 
      error: e?.message || 'Failed to sync checkout session',
      details: e?.stack ? 'Check server logs for details' : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

