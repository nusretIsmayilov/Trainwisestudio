// src/components/customer/mycoach/AICoachProgramSelector.tsx
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Dumbbell, Apple, Brain, ArrowRight, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ProgramType = 'fitness' | 'nutrition' | 'mental_health';

interface ProgramTypeOption {
  id: ProgramType;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  gradient: string;
}

const programTypes: ProgramTypeOption[] = [
  {
    id: 'fitness',
    label: 'Fitness',
    description: 'Personalized workout plans and exercise routines',
    icon: Dumbbell,
    accent: 'text-[#F97316]',
    accentBg: 'bg-[#F97316]/15',
    gradient: 'from-white via-white to-[#F97316]/10 dark:from-slate-950 dark:via-slate-950 dark:to-[#F97316]/20',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    description: 'Custom meal plans and dietary guidance',
    icon: Apple,
    accent: 'text-[#10B981]',
    accentBg: 'bg-[#10B981]/15',
    gradient: 'from-white via-white to-[#10B981]/10 dark:from-slate-950 dark:via-slate-950 dark:to-[#10B981]/20',
  },
  {
    id: 'mental_health',
    label: 'Mental Health',
    description: 'Mindfulness, meditation, and stress management',
    icon: Brain,
    accent: 'text-[#6366F1]',
    accentBg: 'bg-[#6366F1]/15',
    gradient: 'from-white via-white to-[#6366F1]/10 dark:from-slate-950 dark:via-slate-950 dark:to-[#6366F1]/20',
  },
];

interface AICoachProgramSelectorProps {
  onProgramGenerated?: (programId: string, category: string) => void;
}

const AICoachProgramSelector: React.FC<AICoachProgramSelectorProps> = ({ onProgramGenerated }) => {
  const { user } = useAuth();
  const { planStatus } = usePaymentPlan();
  const [selectedType, setSelectedType] = useState<ProgramType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasPlanAccess = planStatus.hasActivePlan;
  const isTrialPlan = planStatus.hasActiveTrial && !planStatus.hasActiveSubscription;
  const statusBadge = useMemo(() => {
    if (!planStatus.hasActivePlan) return null;
    if (isTrialPlan) {
      return { label: '7-day trial access', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' };
    }
    return { label: 'Premium unlocked', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' };
  }, [planStatus.hasActivePlan, isTrialPlan]);

  const handleGenerateProgram = async () => {
    // Prevent action if no active plan
    if (!hasPlanAccess) {
      toast.error('AI Coach requires an active subscription or trial. Please upgrade to access this feature.');
      return;
    }

    if (!selectedType || !user?.id) {
      toast.error('Please select a program type');
      return;
    }

    setIsGenerating(true);

    try {
      // Call the AI generate plan edge function
      const { data, error } = await supabase.functions.invoke('ai-generate-plan', {
        body: { 
          userId: user.id,
          category: selectedType === 'mental_health' ? 'mental_health' : selectedType
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Save the generated program to the database
      if (data?.plan) {
        // Map internal category names to database enum values
        const categoryMap: Record<ProgramType, 'fitness' | 'nutrition' | 'mental health'> = {
          fitness: 'fitness',
          nutrition: 'nutrition',
          mental_health: 'mental health', // Database uses 'mental health' with space
        };
        
        const dbCategory = categoryMap[selectedType];
        
        const { data: programData, error: insertError } = await supabase
          .from('programs')
          .insert({
            name: data.plan.summary || `${selectedType} Program`,
            description: `AI-generated ${selectedType} program`,
            status: 'active',
            category: dbCategory,
            coach_id: user.id, // AI coach
            assigned_to: user.id,
            scheduled_date: new Date().toISOString(),
            plan: data.plan,
            is_ai_generated: true,
          })
          .select('id, category')
          .single();

        if (insertError) {
          throw insertError;
        }

        toast.success(`Your ${selectedType} program has been generated!`);
        
        if (onProgramGenerated && programData) {
          onProgramGenerated(programData.id, programData.category);
        }

        // Reset selection
        setSelectedType(null);
      }
    } catch (error: any) {
      console.error('Error generating program:', error);
      
      // Check if error is about subscription
      const errorMessage = error?.message || String(error);
      const errorText = typeof error === 'string' ? error : errorMessage;
      
      if (errorText.includes('subscription') || errorText.includes('trial') || errorText.includes('active subscription')) {
        toast.error('AI Coach requires an active subscription or trial. Please upgrade to access this feature.');
      } else {
        toast.error(errorMessage || 'Failed to generate program. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-white/95 dark:bg-slate-950/60 backdrop-blur-lg shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground">AI Coach Program Generator</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Pick a focus, tap generate, and we’ll build a tailored plan that matches your current journey.
            </CardDescription>
          </div>
        </div>
        {statusBadge && (
          <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm', statusBadge.tone)}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {statusBadge.label}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer rounded-2xl border border-border/60 bg-white/95 dark:bg-slate-950/60 bg-gradient-to-br shadow-sm transition-all',
                    type.gradient,
                    selectedType === type.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:border-primary/40 hover:shadow-md'
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-inner', type.accentBg)}>
                      <Icon className={cn('w-6 h-6', type.accent)} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-foreground">{type.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                    </div>
                    {selectedType === type.id && (
                      <Badge className="bg-primary text-primary-foreground border-0">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateProgram}
          disabled={!selectedType || isGenerating || !hasPlanAccess}
          className={cn(
            "w-full h-12 text-base font-semibold",
            (!hasPlanAccess || !selectedType || isGenerating) && "pointer-events-none"
          )}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Your Program...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Program
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {selectedType
            ? `Your personalized ${programTypes.find(t => t.id === selectedType)?.label.toLowerCase()} plan will reflect your onboarding goals and preferences.`
            : 'Select a focus to preview what your AI coach will build for you.'}
        </div>

        {!hasPlanAccess && (
          <p className="text-xs text-center text-amber-600 dark:text-amber-300">
            Start your 7-day free trial or subscribe to unlock AI-generated programs.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AICoachProgramSelector;

