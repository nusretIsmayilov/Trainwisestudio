import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

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
      text: `Movements were modified to protect your ${injuries[0]}. Recovery cues are built into each week.`,
      emoji: '🛡️',
      type: 'warning',
    });
  }

  if (likes.length > 0) {
    insights.push({
      id: 'insight-favorite',
      title: 'Preferred Training Detected',
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
      description: 'Power down screens 30 minutes before bed and follow the guided breathing inside your plan.',
      category: 'mental',
      emoji: '🌙',
    });
  }

  if (goals.some(goal => goal.toLowerCase().includes('muscle'))) {
    recommendations.push({
      id: 'rec-strength',
      title: 'Progressive Overload',
      description: 'Track two lifts weekly and add 2-5lbs whenever you complete all reps with solid form.',
      category: 'fitness',
      emoji: '💪',
    });
  }

  if (goals.some(goal => goal.toLowerCase().includes('nutrition'))) {
    recommendations.push({
      id: 'rec-nutrition',
      title: 'Protein Anchor',
      description: 'Aim for 25-35g of protein every meal. We preloaded grocery tips inside your nutrition plan.',
      category: 'nutrition',
      emoji: '🥗',
    });
  }

  if (meditationExperience === 'beginner') {
    recommendations.push({
      id: 'rec-mindfulness',
      title: 'Micro Mindfulness',
      description: 'Start with 5-minute sessions right after workouts to lock in motivation and reduce stress.',
      category: 'mental',
      emoji: '🧠',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default',
      title: 'Stay Consistent',
      description: 'Follow the AI plan schedule for one full week, then log a quick check-in so we can adapt.',
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
      console.log('[WEBHOOK][AI] Personalization already exists, skipping generation', { userId });
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
      console.log('[WEBHOOK][AI] Generating starter plans for user', { userId });
      await callSupabaseFunction('ai-generate-plans', { userId });
    } else {
      console.log('[WEBHOOK][AI] AI programs already present for user', { userId });
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
    console.error('[WEBHOOK][AI] Failed to auto-personalize subscriber', { userId, error });
  }
}

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
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[WEBHOOK] Signature verification failed', err?.message);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('[WEBHOOK] checkout.session.completed', {
            sessionId: session.id,
            customer: session.customer,
            subscription: session.subscription,
            client_reference_id: session.client_reference_id,
          });

          if (session.mode === 'payment') {
            // One-time coach offer payment completed
            try {
              const clientRef = (session.client_reference_id as string) || '';
              if (clientRef.startsWith('offer:')) {
                const offerId = clientRef.replace('offer:', '');
                console.log('[WEBHOOK] Processing coach offer payment', { offerId, sessionId: session.id });
                
                const { data: offerRows, error: offerErr } = await supabase
                  .from('coach_offers')
                  .select('*')
                  .eq('id', offerId)
                  .limit(1);
                
                if (offerErr) {
                  console.error('[WEBHOOK] Error fetching offer', { offerId, error: offerErr });
                  throw offerErr;
                }
                
                const offer = offerRows?.[0];
                if (!offer) {
                  console.error('[WEBHOOK] Offer not found', { offerId });
                  throw new Error(`Offer ${offerId} not found`);
                }

                console.log('[WEBHOOK] Offer found', { offerId, coachId: offer.coach_id, customerId: offer.customer_id, price: offer.price, duration: offer.duration_months });

                console.log('[WEBHOOK] Updating coach_offers status to accepted', { offerId });
                const { error: updateOfferError } = await supabase
                  .from('coach_offers')
                  .update({ status: 'accepted' })
                  .eq('id', offerId);
                
                if (updateOfferError) {
                  console.error('[WEBHOOK] Error updating offer status', { offerId, error: updateOfferError });
                  throw updateOfferError;
                }
                
                console.log('[WEBHOOK] Offer marked as accepted', { offerId, status: 'accepted' });

                const weeks = offer.duration_months || 1;
                const expiry = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
                console.log('[WEBHOOK] Updating customer profile after payment', {
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
                    plan_expiry: expiry 
                  })
                  .eq('id', offer.customer_id);
                
                if (profileError) {
                  console.error('[WEBHOOK] Error updating customer profile', { customerId: offer.customer_id, error: profileError });
                  throw profileError;
                }
                
                console.log('[WEBHOOK] Customer profile updated', { customerId: offer.customer_id, coachId: offer.coach_id, plan: `${weeks}-week plan`, plan_expiry: expiry });

                const amountCents = Math.round(Number(offer.price) * 100);
                const platformFee = Math.round(amountCents * 0.15);
                const netAmount = amountCents - platformFee;
                console.log('[WEBHOOK] Creating payout record for offer', {
                  coachId: offer.coach_id,
                  amountCents,
                  platformFee,
                  netAmount,
                });
                const { error: payoutError } = await supabase.from('payouts').insert({
                  coach_id: offer.coach_id,
                  amount_cents: amountCents,
                  platform_fee_cents: platformFee,
                  net_amount_cents: netAmount,
                  status: 'pending',
                  period_start: new Date().toISOString().slice(0,10),
                  period_end: new Date().toISOString().slice(0,10),
                });

                if (payoutError) {
                  console.error('[WEBHOOK] Error creating payout', { coachId: offer.coach_id, error: payoutError });
                  throw payoutError;
                }
                
                console.log('[WEBHOOK] Payout created', { coachId: offer.coach_id, amountCents, platformFee, netAmount });

                try {
                  const startDate = new Date();
                  const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
                  const { error: contractError } = await supabase
                    .from('contracts')
                    .insert({
                      coach_id: offer.coach_id,
                      customer_id: offer.customer_id,
                      offer_id: offer.id,
                      status: 'active',
                      start_date: startDate.toISOString().slice(0,10),
                      end_date: endDate.toISOString().slice(0,10),
                      price_cents: amountCents,
                    });
                  
                  if (contractError) {
                    console.warn('[WEBHOOK] Could not create contract for offer', { offerId, error: contractError });
                  } else {
                    console.log('[WEBHOOK] Contract created', { offerId, startDate: startDate.toISOString().slice(0,10), endDate: endDate.toISOString().slice(0,10) });
                  }
                } catch (contractErr) {
                  console.warn('[WEBHOOK] Could not create contract for offer', { offerId, error: contractErr });
                }

                try {
                  const { data: convo, error: convoError } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('coach_id', offer.coach_id)
                    .eq('customer_id', offer.customer_id)
                    .maybeSingle();
                  
                  if (convoError) {
                    console.error('[WEBHOOK] Error fetching conversation', { error: convoError });
                  }
                  
                  let conversationId = convo?.id as string | undefined;
                  if (!conversationId) {
                    const { data: created, error: createError } = await supabase
                      .from('conversations')
                      .insert({ coach_id: offer.coach_id, customer_id: offer.customer_id, title: 'Coaching Contract' })
                      .select('id')
                      .single();
                    
                    if (createError) {
                      console.error('[WEBHOOK] Error creating conversation', { error: createError });
                    } else {
                      conversationId = created?.id;
                      console.log('[WEBHOOK] Conversation created', { conversationId });
                    }
                  }
                  
                  if (conversationId) {
                    const { error: messageError } = await supabase.from('messages').insert({
                      conversation_id: conversationId,
                      sender_id: offer.coach_id,
                      content: `✅ Your coaching plan is now active for ${weeks} week(s). Let's get started!`,
                      message_type: 'system',
                    });
                    
                    if (messageError) {
                      console.error('[WEBHOOK] Error creating system message', { error: messageError });
                    } else {
                      console.log('[WEBHOOK] System message sent', { conversationId });
                    }
                  }
                } catch (chatErr) {
                  console.warn('[WEBHOOK] Conversation/message setup failed', { error: chatErr });
                }

                console.log('[WEBHOOK] ✅ Coach offer payment processed successfully', { 
                  offerId, 
                  coachId: offer.coach_id, 
                  customerId: offer.customer_id,
                  amount: offer.price,
                  duration: `${weeks} weeks`
                });
              }
            } catch (e) {
              console.error('[WEBHOOK] ❌ One-time payment processing error', { error: e, sessionId: session.id });
            }
          }

          if (session.customer && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

            const refUserId = (session.client_reference_id as string) || null;

            let userId: string | undefined;
            if (refUserId) {
              userId = refUserId;
            } else {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', session.customer as string)
                .limit(1);
              userId = profiles?.[0]?.id;
            }

            if (userId) {
              console.log('[WEBHOOK] Updating profile after checkout', {
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
                  stripe_subscription_id: subscription.id,
                })
                .eq('id', userId);

              await ensureAIAutoPersonalization(supabase, userId);
            } else {
              console.warn('[WEBHOOK] Could not resolve userId for session', session.id);
            }
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .limit(1);
          const userId = profiles?.[0]?.id;
          if (userId) {
            await supabase
              .from('profiles')
              .update({ plan: null, plan_expiry: null, stripe_subscription_id: null })
              .eq('id', userId);
          }
          break;
        }
        default:
          break;
      }
      
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      console.error('[WEBHOOK] Handler error', e);
      return new Response(JSON.stringify({ error: e?.message || 'Webhook handling error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (e: any) {
    console.error('[WEBHOOK] Error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

