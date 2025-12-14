// src/components/coach/dashboard/TaskBoard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoachTasks } from '@/hooks/useCoachDashboard';
import { useTranslation } from 'react-i18next';

const TaskBoard = () => {
  const { tasks } = useCoachTasks();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{t('dashboard.actionBoard')}</h2>
      <p className="text-sm text-muted-foreground -mt-2">{t('dashboard.actionBoardDescription')}</p>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow duration-300 rounded-xl">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2 sm:mt-2", task.color || 'bg-emerald-500')} />
                <div className="flex-1">
                  <p className="text-base font-semibold text-primary">{task.clientName || t('common.customer')}</p>
                  <p className="text-sm text-foreground mt-1 font-medium">{task.task}</p>
                  {task.details && <p className="text-xs text-muted-foreground mt-1">{task.details}</p>}
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0 mt-3 sm:mt-0">
                <Link to={task.link || '/coach/clients'}>
                  {t('common.viewDetails')}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-sm text-muted-foreground">{t('dashboard.noImmediateTasks')}</div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
