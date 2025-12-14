import { Bot, Sparkles, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerProgram } from '@/hooks/useCustomerPrograms';
import { AIInsight, AIRecommendation } from '@/hooks/useAIPersonalization';

type Props = {
  loading: boolean;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  plans: CustomerProgram[];
};

const InsightRow = ({ insight }: { insight: AIInsight }) => (
  <div className="flex items-start gap-3 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-3">
    <div className="text-xl">{insight.emoji || '💡'}</div>
    <div>
      <p className="text-sm font-semibold">{insight.title}</p>
      <p className="text-sm text-muted-foreground">{insight.text}</p>
    </div>
    <Badge variant={insight.type === 'warning' ? 'destructive' : 'secondary'} className="ml-auto text-xs">
      {insight.type === 'warning' ? 'Focus' : 'Win'}
    </Badge>
  </div>
);

const RecommendationRow = ({ recommendation }: { recommendation: AIRecommendation }) => (
  <div className="flex items-start gap-3 rounded-xl border border-amber-100/50 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5 p-3">
    <div className="text-xl">{recommendation.emoji || '✨'}</div>
    <div>
      <p className="text-sm font-semibold">{recommendation.title}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{recommendation.category}</p>
      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
    </div>
  </div>
);

const PlanRow = ({ plan }: { plan: CustomerProgram }) => (
  <div className="rounded-xl border border-indigo-100/60 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/5 p-3 flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border-none">
        <Bot className="w-3 h-3 mr-1" />
        AI Plan
      </Badge>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{plan.category}</span>
    </div>
    <p className="text-sm font-semibold">{plan.name}</p>
    <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
  </div>
);

const Skeleton = () => (
  <Card className="border-2 border-dashed border-muted">
    <CardContent className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded-md w-1/3" />
      <div className="grid md:grid-cols-3 gap-4">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-3">
            {[0, 1].map((row) => (
              <div key={row} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AIPersonalizationPanel = ({ loading, insights, recommendations, plans }: Props) => {
  if (loading && insights.length === 0 && recommendations.length === 0 && plans.length === 0) {
    return <Skeleton />;
  }

  if (!loading && insights.length === 0 && recommendations.length === 0 && plans.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">AI Onboarding Complete</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Your personalized launch plan is ready</h2>
          <p className="text-muted-foreground text-sm">
            We analyzed your onboarding answers, generated fresh programs, and created insights to keep you on track.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" />
              Insights
            </div>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">Insights will appear as soon as we have more data.</p>
            ) : (
              insights.slice(0, 3).map((insight) => <InsightRow key={insight.id} insight={insight} />)
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              <ListChecks className="w-4 h-4" />
              Recommendations
            </div>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">We will add actionable steps after your first check-ins.</p>
            ) : (
              recommendations.slice(0, 3).map((rec) => <RecommendationRow key={rec.id} recommendation={rec} />)
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              <Bot className="w-4 h-4" />
              AI Programs
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">We&apos;ll auto-generate plans once your subscription activates.</p>
            ) : (
              plans.slice(0, 3).map((plan) => <PlanRow key={plan.id} plan={plan} />)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPersonalizationPanel;


