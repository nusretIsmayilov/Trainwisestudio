import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, Dumbbell, Utensils, Brain, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgramPlanViewerProps {
  plan: any;
  category: string;
}

const ProgramPlanViewer: React.FC<ProgramPlanViewerProps> = ({ plan, category }) => {
  if (!plan) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No program plan available</p>
        </CardContent>
      </Card>
    );
  }

  const renderFitnessPlan = (plan: any) => {
    if (!plan || typeof plan !== 'object') return null;

    const weeks = Object.keys(plan).filter(key => key.startsWith('W'));
    
    return (
      <div className="space-y-6">
        {weeks.map((weekKey, weekIndex) => {
          const weekData = plan[weekKey];
          const weekNumber = weekIndex + 1;
          
          return (
            <Card key={weekKey} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Week {weekNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(weekData).map(([day, dayData]: [string, any]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 capitalize">{day}</h4>
                      {dayData && Array.isArray(dayData) && dayData.length > 0 ? (
                        <div className="space-y-2">
                          {dayData.map((exercise: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{exercise.name}</div>
                              {exercise.sets && (
                                <div className="text-muted-foreground">
                                  {exercise.sets} sets
                                  {exercise.reps && ` × ${exercise.reps} reps`}
                                  {exercise.weight && ` @ ${exercise.weight}kg`}
                                </div>
                              )}
                              {exercise.duration && (
                                <div className="text-muted-foreground">
                                  {exercise.duration} minutes
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Rest day</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderNutritionPlan = (plan: any) => {
    if (!plan || typeof plan !== 'object') return null;

    const weeks = Object.keys(plan).filter(key => key.startsWith('W'));
    
    return (
      <div className="space-y-6">
        {weeks.map((weekKey, weekIndex) => {
          const weekData = plan[weekKey];
          const weekNumber = weekIndex + 1;
          
          return (
            <Card key={weekKey} className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-green-500" />
                  Week {weekNumber} - Nutrition Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(weekData).map(([day, dayData]: [string, any]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 capitalize">{day}</h4>
                      {dayData && typeof dayData === 'object' ? (
                        <div className="space-y-3">
                          {Object.entries(dayData).map(([meal, mealData]: [string, any]) => (
                            <div key={meal} className="text-sm">
                              <div className="font-medium capitalize mb-1">{meal}</div>
                              {Array.isArray(mealData) && mealData.length > 0 ? (
                                <div className="space-y-1">
                                  {mealData.map((item: any, index: number) => (
                                    <div key={index} className="text-muted-foreground">
                                      • {item.name}
                                      {item.quantity && ` (${item.quantity})`}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-xs">No items</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No meal plan</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMentalHealthPlan = (plan: any) => {
    if (!plan || typeof plan !== 'object') return null;

    const weeks = Object.keys(plan).filter(key => key.startsWith('W'));
    
    return (
      <div className="space-y-6">
        {weeks.map((weekKey, weekIndex) => {
          const weekData = plan[weekKey];
          const weekNumber = weekIndex + 1;
          
          return (
            <Card key={weekKey} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Week {weekNumber} - Mental Health Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(weekData).map(([day, dayData]: [string, any]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 capitalize">{day}</h4>
                      {dayData && typeof dayData === 'object' ? (
                        <div className="space-y-3">
                          {Object.entries(dayData).map(([activity, activityData]: [string, any]) => (
                            <div key={activity} className="text-sm">
                              <div className="font-medium capitalize mb-1">{activity}</div>
                              {Array.isArray(activityData) && activityData.length > 0 ? (
                                <div className="space-y-1">
                                  {activityData.map((item: any, index: number) => (
                                    <div key={index} className="text-muted-foreground">
                                      • {item.name}
                                      {item.duration && ` (${item.duration} min)`}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-xs">No activities</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No activities</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderPlanContent = () => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return renderFitnessPlan(plan);
      case 'nutrition':
        return renderNutritionPlan(plan);
      case 'mental health':
        return renderMentalHealthPlan(plan);
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Plan format not recognized for category: {category}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {renderPlanContent()}
    </motion.div>
  );
};

export default ProgramPlanViewer;
