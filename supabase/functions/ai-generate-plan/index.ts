import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@6.1.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

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
    const { userId, category } = body; // category: 'fitness' | 'nutrition' | 'mental_health'

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optional: Verify auth token if ANON_KEY is available
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (anonKey) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        try {
          const userSupabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            anonKey,
            {
              global: {
                headers: { Authorization: authHeader },
              },
            }
          );
          const { data: { user }, error: authError } = await userSupabase.auth.getUser();
          if (authError || !user || user.id !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (authErr) {
          console.warn('[AI] Auth verification failed, continuing with service role:', authErr);
        }
      }
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('plan, plan_expiry')
      .eq('id', userId)
      .single();

    if (profileErr) {
      console.error('[AI] Profile fetch error:', profileErr);
      return new Response(JSON.stringify({ error: 'Profile not found', details: profileErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const planExpiry = profile?.plan_expiry ? new Date(profile.plan_expiry) : null;
    
    // Match frontend logic exactly
    const hasActiveTrial = Boolean(
      profile?.plan === 'trial' &&
      planExpiry &&
      planExpiry > now
    );

    const hasActiveSubscription = Boolean(
      profile?.plan &&
      profile.plan !== 'trial' &&
      (planExpiry ? planExpiry > now : true)
    );

    const hasAccess = hasActiveTrial || hasActiveSubscription;
    
    if (!hasAccess) {
      console.log('[AI] Access denied:', { 
        userId, 
        plan: profile?.plan, 
        planExpiry: profile?.plan_expiry,
        hasActiveTrial,
        hasActiveSubscription,
        now: now.toISOString()
      });
      return new Response(JSON.stringify({ 
        error: 'AI Coach requires an active subscription or trial',
        details: {
          plan: profile?.plan,
          planExpiry: profile?.plan_expiry,
          hasActiveTrial,
          hasActiveSubscription
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const planDurationDays = hasActiveTrial && !hasActiveSubscription ? 7 : 28;
    const planWeeks = Math.ceil(planDurationDays / 7);
    const durationDescription = planDurationDays === 7 
      ? 'a focused 7-day program'
      : 'an in-depth 4-week (28 day) program';
    const scheduleInstruction = `schedule (array of ${planDurationDays} entries${planDurationDays > 7 ? ', label each week' : ''})`;

    const baseWeekSchedule = [
      { day: 'Monday', workout: 'Full-body strength', nutrition: 'High protein, balanced carbs', mindfulness: '10m breathing' },
      { day: 'Tuesday', workout: 'Zone 2 cardio 30m', nutrition: 'Mediterranean plate', mindfulness: 'Body scan 10m' },
      { day: 'Wednesday', workout: 'Mobility + core', nutrition: 'Balanced bowl', mindfulness: 'Gratitude journaling' },
      { day: 'Thursday', workout: 'Upper strength', nutrition: 'High protein focus', mindfulness: 'Box breathing 8m' },
      { day: 'Friday', workout: 'Intervals 20m', nutrition: 'Complex carbs emphasis', mindfulness: 'Mindful walk' },
      { day: 'Saturday', workout: 'Lower strength', nutrition: 'Protein + greens', mindfulness: 'Meditation 12m' },
      { day: 'Sunday', workout: 'Rest / light yoga', nutrition: 'Free choice within macros', mindfulness: 'Reflection 10m' },
    ];

    const buildSchedule = (days: number) => {
      if (days <= 7) {
        return baseWeekSchedule.slice(0, days);
      }

      const expanded: any[] = [];
      let remaining = days;
      let week = 0;

      while (remaining > 0) {
        for (const entry of baseWeekSchedule) {
          if (remaining <= 0) break;
          expanded.push({
            ...entry,
            day: `Week ${week + 1} - ${entry.day}`,
          });
          remaining -= 1;
        }
        week += 1;
      }

      return expanded;
    };

    const { data: details, error } = await supabase
      .from('onboarding_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('[AI] onboarding_details fetch error', error.message);
    }

    const basePlan = {
      generatedAt: new Date().toISOString(),
      summary: `Personalized ${planDurationDays}-day coaching plan`,
      goals: details?.goals || [],
      durationDays: planDurationDays,
      weeks: planWeeks,
      schedule: buildSchedule(planDurationDays),
      personalization: {
        injuries: details?.injuries || [],
        allergies: details?.allergies || [],
        meditationExperience: details?.meditation_experience || 'beginner',
      }
    };

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_KEY');
    
    if (!geminiKey && !openaiKey) {
      return new Response(JSON.stringify({ plan: basePlan, status: 'ready', source: 'base' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Category-specific prompts
      const categoryPrompts: Record<string, { system: string; user: string }> = {
        fitness: {
          system: `You are a world-class fitness coach. Create ${durationDescription} focusing on strength, cardio, and mobility.
Respond in JSON with fields: generatedAt (ISO), summary (string), goals (array), weeks (number), durationDays (number), ${scheduleInstruction} with objects containing day, workout, sets, reps, rest, notes, personalization (object with injuries, fitnessLevel).`,
          user: `User goals: ${JSON.stringify(details?.goals || [])}
Injuries: ${JSON.stringify(details?.injuries || [])}
Training preferences: ${JSON.stringify(details?.training_likes || [])}
Training dislikes: ${JSON.stringify(details?.training_dislikes || [])}`
        },
        nutrition: {
          system: `You are a world-class nutritionist. Create ${durationDescription} focusing on balanced meals, macros, and meal timing.
Respond in JSON with fields: generatedAt (ISO), summary (string), goals (array), weeks (number), durationDays (number), ${scheduleInstruction} with objects containing day, breakfast, lunch, dinner, snacks, macros, notes, personalization (object with allergies, dietaryPreferences).`,
          user: `User goals: ${JSON.stringify(details?.goals || [])}
Allergies: ${JSON.stringify(details?.allergies || [])}
Weight: ${details?.weight || 'not specified'} kg
Height: ${details?.height || 'not specified'} cm`
        },
        mental_health: {
          system: `You are a world-class mental health coach. Create ${durationDescription} centered on mindfulness and mental wellness.
Respond in JSON with fields: generatedAt (ISO), summary (string), goals (array), weeks (number), durationDays (number), ${scheduleInstruction} with objects containing day, meditation, breathing, journaling, selfCare, notes, personalization (object with meditationExperience, stressLevel).`,
          user: `User goals: ${JSON.stringify(details?.goals || [])}
Meditation experience: ${JSON.stringify(details?.meditation_experience || 'beginner')}
Training preferences: ${JSON.stringify(details?.training_likes || [])}`
        }
      };

      const selectedCategory = category || 'fitness';
      const prompts = categoryPrompts[selectedCategory] || categoryPrompts.fitness;
      
      const systemPrompt = prompts.system;
      const userPrompt = prompts.user;

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${systemPrompt}\n\n${userPrompt}\n\nReturn only valid JSON.`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);
        return new Response(JSON.stringify({ plan: parsed, status: 'ready', source: 'gemini' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const client = new OpenAI({ apiKey: openaiKey as string });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      const content = completion.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify({ plan: parsed, status: 'ready', source: 'openai' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (llmErr: any) {
      console.warn('[AI] OpenAI error, falling back to base plan', llmErr?.message);
      return new Response(JSON.stringify({ plan: basePlan, status: 'processing' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (e: any) {
    console.error('[AI] generate-plan error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to generate plan' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

