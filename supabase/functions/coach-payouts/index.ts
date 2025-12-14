import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createSupabaseClient(req);
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const action = url.searchParams.get('action');
      
      if (action === 'settings') {
        const coachId = url.searchParams.get('coachId');
        if (!coachId) {
          return new Response(JSON.stringify({ error: 'coachId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: settings, error } = await supabase
          .from('coach_payout_settings')
          .select('*')
          .eq('coach_id', coachId)
          .single();

        if (error && error.code !== 'PGRST116') {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ settings: settings || null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'balance') {
        const coachId = url.searchParams.get('coachId');
        if (!coachId) {
          return new Response(JSON.stringify({ error: 'coachId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: payouts, error: payoutsError } = await supabase
          .from('payouts')
          .select('net_amount_cents, status')
          .eq('coach_id', coachId);

        if (payoutsError) {
          return new Response(JSON.stringify({ error: payoutsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const totalEarnings = payouts
          ?.filter(p => p.status === 'paid')
          ?.reduce((sum, p) => sum + p.net_amount_cents, 0) || 0;

        const pendingAmount = payouts
          ?.filter(p => p.status === 'pending')
          ?.reduce((sum, p) => sum + p.net_amount_cents, 0) || 0;

        const availableBalance = totalEarnings - pendingAmount;

        return new Response(JSON.stringify({ 
          totalEarnings,
          pendingAmount,
          availableBalance,
          availableBalanceFormatted: `$${(availableBalance / 100).toFixed(2)}`
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const action = body.action;

      if (action === 'update-settings') {
        const { coachId, payoutMethod, bankDetails, paypalEmail, paypalAccountId, stripeAccountId } = body;
        if (!coachId) {
          return new Response(JSON.stringify({ error: 'coachId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const settings = {
          coach_id: coachId,
          payout_method: payoutMethod,
          bank_details: bankDetails || null,
          paypal_email: paypalEmail || null,
          paypal_account_id: paypalAccountId || null,
          stripe_account_id: stripeAccountId || null,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('coach_payout_settings')
          .upsert(settings, { onConflict: 'coach_id' })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ settings: data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'request-payout') {
        const { coachId, amountCents } = body;
        if (!coachId || !amountCents || amountCents <= 0) {
          return new Response(JSON.stringify({ error: 'coachId and amountCents required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: balanceData } = await supabase
          .from('payouts')
          .select('net_amount_cents, status')
          .eq('coach_id', coachId);

        const totalEarnings = balanceData
          ?.filter(p => p.status === 'paid')
          ?.reduce((sum, p) => sum + p.net_amount_cents, 0) || 0;

        const pendingAmount = balanceData
          ?.filter(p => p.status === 'pending')
          ?.reduce((sum, p) => sum + p.net_amount_cents, 0) || 0;

        const availableBalance = totalEarnings - pendingAmount;

        if (amountCents > availableBalance) {
          return new Response(JSON.stringify({ error: 'Insufficient available balance' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('payouts')
          .insert({
            coach_id: coachId,
            amount_cents: amountCents,
            platform_fee_cents: 0,
            net_amount_cents: amountCents,
            status: 'pending',
            period_start: new Date().toISOString().slice(0,10),
            period_end: new Date().toISOString().slice(0,10),
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ payout: data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'request') {
        const { coachId, amountCents } = body;
        if (!coachId || !amountCents || amountCents <= 0) {
          return new Response(JSON.stringify({ error: 'coachId and amountCents required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const platformFee = Math.round(amountCents * 0.15);
        const netAmount = amountCents - platformFee;
        
        await supabase.from('payouts').insert({
          coach_id: coachId,
          amount_cents: amountCents,
          platform_fee_cents: platformFee,
          net_amount_cents: netAmount,
          status: 'pending',
          period_start: new Date().toISOString().slice(0,10),
          period_end: new Date().toISOString().slice(0,10),
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid action or method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

