import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from './_shared.ts';
import OpenAI from 'https://esm.sh/openai@6.1.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

function generateFallbackRecommendations(trends: any, userGoals: string[], userProfile: any) {
  const recommendations = [];
  
  if (trends.dailyCheckins?.water?.trend === 'down') {
    recommendations.push({
      id: 'water-1',
      title: 'Hydration Focus',
      description: 'Your water intake has decreased. Try setting hourly reminders to drink water.',
      category: 'nutrition',
      priority: 'high',
      actionable: true,
      emoji: '💧'
    });
  }
  
  if (trends.dailyCheckins?.mood?.trend === 'down') {
    recommendations.push({
      id: 'mood-1',
      title: 'Mood Support',
      description: 'Consider adding more outdoor activities or social connections to boost your mood.',
      category: 'mental',
      priority: 'high',
      actionable: true,
      emoji: '😊'
    });
  }
  
  if (trends.dailyCheckins?.sleep?.trend === 'down') {
    recommendations.push({
      id: 'sleep-1',
      title: 'Sleep Optimization',
      description: 'Your sleep hours have decreased. Try establishing a consistent bedtime routine.',
      category: 'general',
      priority: 'high',
      actionable: true,
      emoji: '😴'
    });
  }
  
  return recommendations;
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
    const body = await req.json();
    const { trends, userGoals, userProfile } = body;
    
    if (!trends) {
      return new Response(JSON.stringify({ error: 'trends required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_KEY');
    
    if (!geminiKey && !openaiKey) {
      const recommendations = generateFallbackRecommendations(trends, userGoals || [], userProfile || {});
      return new Response(JSON.stringify({ recommendations }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const prompt = `Analyze these health trends and provide personalized recommendations:

Trends: ${JSON.stringify(trends, null, 2)}
User Goals: ${JSON.stringify(userGoals || [])}
User Profile: ${JSON.stringify(userProfile || {})}

Provide 3-5 actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Recommendation Title",
      "description": "Detailed description of the recommendation",
      "category": "fitness|nutrition|mental|general",
      "priority": "high|medium|low",
      "actionable": true,
      "emoji": "relevant emoji"
    }
  ]
}

Focus on trends that show decline or need improvement. Be specific and actionable.`;

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const client = new OpenAI({ apiKey: openaiKey as string });
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });
        const content = completion.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (llmErr: any) {
      console.warn('[AI] LLM error, falling back to rule-based recommendations', llmErr?.message);
      const recommendations = generateFallbackRecommendations(trends, userGoals || [], userProfile || {});
      return new Response(JSON.stringify({ recommendations }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (e: any) {
    console.error('[AI] trend-recommendations error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to generate recommendations' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

