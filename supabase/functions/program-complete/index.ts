import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

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
    const supabase = createSupabaseClient(req);
    const body = await req.json();
    const { programId, coachId, customerId } = body;

    if (!programId || !coachId || !customerId) {
      return new Response(JSON.stringify({ error: 'programId, coachId, and customerId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('price_cents, status, coach_id, customer_id')
      .eq('id', programId)
      .single();

    if (programError) {
      return new Response(JSON.stringify({ error: programError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!program || program.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Program not active or not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (program.coach_id !== coachId || program.customer_id !== customerId) {
      return new Response(JSON.stringify({ error: 'Unauthorized to complete this program' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalPrice = program.price_cents;
    const coachAmount = Math.round(totalPrice * 0.8);
    const platformFee = totalPrice - coachAmount;

    const { error: updateError } = await supabase
      .from('programs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        coach_id: coachId,
        amount_cents: totalPrice,
        platform_fee_cents: platformFee,
        net_amount_cents: coachAmount,
        status: 'pending',
        payout_type: 'completion',
        program_id: programId,
        period_start: new Date().toISOString().slice(0,10),
        period_end: new Date().toISOString().slice(0,10),
      })
      .select()
      .single();

    if (payoutError) {
      return new Response(JSON.stringify({ error: payoutError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: completion, error: completionError } = await supabase
      .from('program_completions')
      .insert({
        program_id: programId,
        coach_id: coachId,
        customer_id: customerId,
        completion_date: new Date().toISOString(),
        coach_payout_cents: coachAmount,
        platform_fee_cents: platformFee,
        status: 'completed'
      })
      .select()
      .single();

    if (completionError) {
      return new Response(JSON.stringify({ error: completionError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payout, 
      completion,
      coachAmount: coachAmount,
      platformFee: platformFee,
      message: 'Program completed successfully. Coach payout initiated.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to complete program' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

