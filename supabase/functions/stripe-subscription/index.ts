import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createStripeClient, createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

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
    const { action, subscriptionId, stripeCustomerId, userId } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'action required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let subId = subscriptionId;
    if (!subId && stripeCustomerId) {
      const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active', limit: 1 });
      subId = subs.data?.[0]?.id;
      if (!subId) {
        return new Response(JSON.stringify({ error: 'Active subscription not found for customer' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!subId) {
      return new Response(JSON.stringify({ error: 'subscriptionId or stripeCustomerId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result: any;

    switch (action) {
      case 'cancel-at-period-end':
        const sub1 = await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
        result = { success: true, current_period_end: sub1.current_period_end };
        break;
      
      case 'resume':
        const sub2 = await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
        result = { success: true };
        break;
      
      case 'cancel-now':
        const sub3 = await stripe.subscriptions.cancel(subId);
        if (userId) {
          await supabase
            .from('profiles')
            .update({ plan: null, plan_expiry: null, stripe_subscription_id: null })
            .eq('id', userId);
        }
        result = { success: true, canceled_at: sub3.canceled_at };
        break;
      
      case 'cancel-graceful':
        if (!userId) {
          return new Response(JSON.stringify({ error: 'userId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: profileRows, error: profileErr } = await supabase
          .from('profiles')
          .select('id, stripe_customer_id')
          .eq('id', userId)
          .limit(1);
        
        if (profileErr) {
          return new Response(JSON.stringify({ error: profileErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const profile = profileRows?.[0] as { id: string; stripe_customer_id: string | null } | undefined;
        if (!profile) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          let subId2: string | undefined;
          if (profile.stripe_customer_id) {
            const subs = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'active', limit: 1 });
            subId2 = subs.data?.[0]?.id;
          }
          if (subId2) {
            await stripe.subscriptions.cancel(subId2);
          }
        } catch (e) {
          // ignore subscription cancel errors
        }

        const { error: updErr } = await supabase
          .from('profiles')
          .update({ plan: null, plan_expiry: null, stripe_customer_id: null })
          .eq('id', userId);
        
        if (updErr) {
          return new Response(JSON.stringify({ error: updErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        result = { success: true };
        break;
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to process subscription action' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

