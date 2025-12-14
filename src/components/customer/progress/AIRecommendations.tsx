import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIRecommendation } from '@/hooks/useAIPersonalization';
import { Sparkles } from 'lucide-react';

type Props = {
  recommendations: AIRecommendation[];
  loading?: boolean;
};

const AIRecommendations = ({ recommendations, loading }: Props) => {
  if (loading && recommendations.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="p-6 space-y-3 animate-pulse">
          <div className="h-5 bg-muted rounded-md w-1/4" />
          <div className="h-20 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
          <Sparkles className="w-4 h-4" />
          <p className="text-sm font-semibold uppercase tracking-wide">AI Recommendations</p>
        </div>
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-white dark:bg-transparent p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{rec.emoji || '✨'}</span>
                <div>
                  <p className="text-base font-semibold">{rec.title}</p>
                  <Badge variant="outline" className="text-xs uppercase tracking-wide">
                    {rec.category}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;


