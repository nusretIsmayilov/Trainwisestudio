import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { useProfileStrength } from '@/hooks/useProfileStrength';
import { getProfileStrengthColor, getProfileStrengthBgColor, getProfileStrengthIcon } from '@/lib/coach/profile-strength';
import { useNavigate } from 'react-router-dom';

export const ProfileStrengthCard = () => {
  const { strengthData, loading, error } = useProfileStrength();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !strengthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Unable to calculate profile strength'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { percentage, level, recommendations, completedItems, missingItems } = strengthData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Profile Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{getProfileStrengthIcon(level)}</span>
            <div>
              <div className={`text-2xl font-bold ${getProfileStrengthColor(percentage)}`}>
                {percentage}%
              </div>
              <Badge variant="secondary" className={getProfileStrengthBgColor(percentage)}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Badge>
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedItems.length})
            </h4>
            <div className="space-y-1">
              {completedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Items */}
        {missingItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-amber-700 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Missing ({missingItems.length})
            </h4>
            <div className="space-y-1">
              {missingItems.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{item}</span>
                </div>
              ))}
              {missingItems.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{missingItems.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-1">
              {recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  • {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/coach/settings')}
        >
          Improve Profile
        </Button>
      </CardContent>
    </Card>
  );
};
