import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createSupabaseClient(req);
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const programId = url.searchParams.get('programId');
      if (!programId) {
        return new Response(JSON.stringify({ error: 'programId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: program, error } = await supabase
        .from('programs')
        .select('duration_weeks, start_date, status')
        .eq('id', programId)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!program || program.status !== 'active') {
        return new Response(JSON.stringify({ extensionAvailable: false, reason: 'Program not active' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const startDate = new Date(program.start_date);
      const now = new Date();
      const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const totalWeeks = program.duration_weeks;
      const weeksRemaining = totalWeeks - weeksElapsed;
      const percentageRemaining = (weeksRemaining / totalWeeks) * 100;

      const extensionAvailable = percentageRemaining <= 20 && weeksRemaining > 0;

      return new Response(JSON.stringify({
        extensionAvailable,
        weeksElapsed,
        totalWeeks,
        weeksRemaining,
        percentageRemaining: Math.round(percentageRemaining),
        reason: extensionAvailable ? 'Extension available' : 'Extension not yet available'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { programId, extensionWeeks, coachId, customerId } = body;
      
      if (!programId || !extensionWeeks || !coachId || !customerId) {
        return new Response(JSON.stringify({ error: 'programId, extensionWeeks, coachId, and customerId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('duration_weeks, start_date, status, price_cents')
        .eq('id', programId)
        .single();

      if (programError) {
        return new Response(JSON.stringify({ error: programError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!program || program.status !== 'active') {
        return new Response(JSON.stringify({ error: 'Program not active' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const startDate = new Date(program.start_date);
      const now = new Date();
      const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const totalWeeks = program.duration_weeks;
      const weeksRemaining = totalWeeks - weeksElapsed;
      const percentageRemaining = (weeksRemaining / totalWeeks) * 100;

      if (percentageRemaining > 20) {
        return new Response(JSON.stringify({ error: 'Extension not yet available (more than 20% remaining)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const weeklyPrice = program.price_cents / totalWeeks;
      const extensionPrice = Math.round(weeklyPrice * extensionWeeks);

      const { data: extension, error: extensionError } = await supabase
        .from('contract_extensions')
        .insert({
          program_id: programId,
          coach_id: coachId,
          customer_id: customerId,
          extension_weeks: extensionWeeks,
          extension_price_cents: extensionPrice,
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select()
        .single();

      if (extensionError) {
        return new Response(JSON.stringify({ error: extensionError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ extension }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && url.searchParams.get('list') === 'true') {
      const programId = url.searchParams.get('programId');
      if (!programId) {
        return new Response(JSON.stringify({ error: 'programId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: extensions, error } = await supabase
        .from('contract_extensions')
        .select('*')
        .eq('program_id', programId)
        .order('requested_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ extensions }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

