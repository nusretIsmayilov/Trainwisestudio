import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createSupabaseClient(req);
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || req.method === 'POST' ? (await req.json().catch(() => ({}))).action : null;

  try {
    if (req.method === 'POST' && action === 'expire') {
      const today = new Date().toISOString().slice(0,10);
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, coach_id, customer_id, end_date')
        .eq('status', 'active')
        .lt('end_date', today);
      
      for (const c of contracts || []) {
        await supabase.from('contracts').update({ status: 'expired' }).eq('id', c.id);
        try {
          const { data: convo } = await supabase
            .from('conversations')
            .select('id')
            .eq('coach_id', c.coach_id)
            .eq('customer_id', c.customer_id)
            .maybeSingle();
          if (convo?.id) {
            await supabase.from('messages').insert({
              conversation_id: convo.id,
              sender_id: c.coach_id,
              content: 'Contract period ended. This chat is now closed. Renew to continue.',
              type: 'system',
            });
          }
        } catch {}
      }
      return new Response(JSON.stringify({ ok: true, expired: (contracts || []).length }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'renew') {
      const body = await req.json();
      const { contractId, months } = body;
      if (!contractId) {
        return new Response(JSON.stringify({ error: 'contractId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const durationMonths = Math.max(1, months || 1);
      const { data: rows, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .limit(1);
      
      const prev = rows?.[0];
      if (error || !prev) {
        return new Response(JSON.stringify({ error: 'Contract not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const start = new Date();
      const end = new Date(start.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
      const { data: inserted, error: insertErr } = await supabase
        .from('contracts')
        .insert({
          coach_id: prev.coach_id,
          customer_id: prev.customer_id,
          status: 'active',
          start_date: start.toISOString().slice(0,10),
          end_date: end.toISOString().slice(0,10),
          price_cents: prev.price_cents,
          platform_fee_rate: prev.platform_fee_rate,
        })
        .select('id')
        .single();
      
      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: convo } = await supabase
        .from('conversations')
        .select('id')
        .eq('coach_id', prev.coach_id)
        .eq('customer_id', prev.customer_id)
        .maybeSingle();
      
      let conversationId = convo?.id as string | undefined;
      if (!conversationId) {
        const { data: created } = await supabase
          .from('conversations')
          .insert({ coach_id: prev.coach_id, customer_id: prev.customer_id, title: 'Coaching Contract' })
          .select('id')
          .single();
        conversationId = created?.id;
      }
      
      if (conversationId) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: prev.coach_id,
          content: `Contract renewed for ${durationMonths} month(s). Welcome back!`,
          type: 'system',
        });
      }
      
      return new Response(JSON.stringify({ ok: true, contract_id: inserted?.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'sign') {
      const body = await req.json();
      const { contractId, actor, documentUrl } = body;
      if (!contractId || !actor) {
        return new Response(JSON.stringify({ error: 'contractId and actor required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fields: any = {};
      if (documentUrl) fields.document_url = documentUrl;
      if (actor === 'coach') fields.coach_signed_at = new Date().toISOString();
      if (actor === 'customer') fields.customer_signed_at = new Date().toISOString();
      
      const { error } = await supabase.from('contracts').update(fields).eq('id', contractId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to process contract action' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

