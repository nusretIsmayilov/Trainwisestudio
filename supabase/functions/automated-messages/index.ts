import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, corsHeaders, handleCors } from './_shared.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createSupabaseClient(req);
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const messageType = url.searchParams.get('messageType');
      
      const templates = {
        motivational: {
          daily_checkin: [
            "Good morning! 🌅 Ready to make today amazing?",
            "Every day is a new opportunity to invest in yourself.",
            "Remember: progress, not perfection. You're doing great! 💪"
          ],
          weekly_progress: [
            "Amazing work this week! 🎉 Your consistency is paying off.",
            "Week by week, you're building habits that will last a lifetime.",
            "Your dedication is inspiring! This week's progress shows your commitment."
          ],
          milestone_achieved: [
            "Congratulations! 🏆 You've reached an important milestone.",
            "Milestone reached! This is just the beginning of what you're capable of.",
            "Incredible progress! Your consistency and dedication are truly inspiring. 🎯"
          ]
        },
        system: {
          payment_reminder: "Friendly reminder: Your subscription will renew soon.",
          feature_update: "New features are now available! Check out the latest updates.",
          maintenance_notice: "Scheduled maintenance will occur tonight.",
          security_alert: "For your security, please verify your account if needed."
        }
      };

      if (messageType) {
        const category = messageType.startsWith('system_') ? 'system' : 'motivational';
        const type = messageType.replace('system_', '');
        return new Response(JSON.stringify({ templates: templates[category][type] || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ templates }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { userId, messageType, programId, coachId } = body;

      if (!userId || !messageType) {
        return new Response(JSON.stringify({ error: 'userId and messageType required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const motivationalMessages = {
        daily_checkin: [
          "Good morning! 🌅 Ready to make today amazing? Your health journey continues with small, consistent steps.",
          "Every day is a new opportunity to invest in yourself. How are you feeling today?",
          "Remember: progress, not perfection. You're doing great! 💪",
          "Your future self will thank you for the choices you make today. Keep going! ✨"
        ],
        weekly_progress: [
          "Amazing work this week! 🎉 Your consistency is paying off. Keep up the great momentum!",
          "Week by week, you're building habits that will last a lifetime. Proud of your progress!",
          "Every week brings new challenges and victories. You're handling both beautifully! 🌟",
          "Your dedication is inspiring! This week's progress shows your commitment to growth."
        ],
        milestone_achieved: [
          "Congratulations! 🏆 You've reached an important milestone. Your hard work is paying off!",
          "Milestone reached! This is just the beginning of what you're capable of achieving.",
          "Incredible progress! Your consistency and dedication are truly inspiring. 🎯",
          "Well done! Every milestone is a stepping stone to your ultimate goals. Keep going!"
        ],
        program_start: [
          "Welcome to your transformation journey! 🚀 You've taken the first step towards a healthier, happier you.",
          "Exciting times ahead! Your commitment to change is the foundation of your success.",
          "Ready to begin? Your future self is already thanking you for this decision! 💫",
          "The journey of a thousand miles begins with a single step. You've taken it! 🌟"
        ],
        program_completion: [
          "Congratulations on completing your program! 🎊 You've shown incredible dedication and achieved something amazing.",
          "What an achievement! Your commitment to your health and wellness journey is truly inspiring.",
          "Program complete! You've proven that with dedication, anything is possible. Well done! 🏆",
          "Incredible work! You've transformed not just your body, but your mindset and habits too."
        ],
        motivation_boost: [
          "You've got this! 💪 Remember why you started and keep pushing forward.",
          "Challenges are opportunities in disguise. You're stronger than you think!",
          "Every expert was once a beginner. You're on the right path! 🌟",
          "Your only competition is the person you were yesterday. Keep improving! 🎯"
        ]
      };

      const systemMessages = {
        payment_reminder: "Friendly reminder: Your subscription will renew soon. Keep your wellness journey uninterrupted! 💳",
        feature_update: "New features are now available! Check out the latest updates to enhance your experience. 🆕",
        maintenance_notice: "Scheduled maintenance will occur tonight. We'll be back online shortly! 🔧",
        security_alert: "For your security, please verify your account if you notice any unusual activity. 🔒"
      };

      let messageContent = '';
      let messageCategory = 'motivational';

      if (messageType.startsWith('system_')) {
        const systemType = messageType.replace('system_', '');
        messageContent = systemMessages[systemType as keyof typeof systemMessages] || 'System notification';
        messageCategory = 'system';
      } else {
        const messages = motivationalMessages[messageType as keyof typeof motivationalMessages];
        if (messages) {
          messageContent = messages[Math.floor(Math.random() * messages.length)];
        } else {
          messageContent = 'Keep up the great work! Your dedication is inspiring.';
        }
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: coachId || 'system',
          receiver_id: userId,
          content: messageContent,
          message_type: messageType,
          category: messageCategory,
          is_automated: true,
          program_id: programId || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message,
        content: messageContent 
      }), {
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

