import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, Target, CheckCircle } from 'lucide-react';

interface ProgramCountdownProps {
  programId: string;
  startDate: string;
  durationWeeks: number;
  status: 'pending' | 'active' | 'completed' | 'paused';
  onStatusChange?: (status: string) => void;
}

interface TimeRemaining {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const ProgramCountdown = ({ 
  programId, 
  startDate, 
  durationWeeks, 
  status,
  onStatusChange 
}: ProgramCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (status !== 'active') {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [startDate, durationWeeks, status]);

  const calculateTimeRemaining = () => {
    const start = new Date(startDate);
    const now = new Date();
    const end = new Date(start.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000));

    if (now >= end) {
      setTimeRemaining({
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
      setProgress(100);
      onStatusChange?.('completed');
      return;
    }

    if (now < start) {
      // Program hasn't started yet
      const timeUntilStart = start.getTime() - now.getTime();
      const daysUntilStart = Math.ceil(timeUntilStart / (24 * 60 * 60 * 1000));
      
      setTimeRemaining({
        weeks: Math.floor(daysUntilStart / 7),
        days: daysUntilStart % 7,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
      setProgress(0);
      return;
    }

    // Program is active
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();

    const weeksRemaining = Math.floor(remaining / (7 * 24 * 60 * 60 * 1000));
    const daysRemaining = Math.floor((remaining % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutesRemaining = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const secondsRemaining = Math.floor((remaining % (60 * 1000)) / 1000);

    setTimeRemaining({
      weeks: weeksRemaining,
      days: daysRemaining,
      hours: hoursRemaining,
      minutes: minutesRemaining,
      seconds: secondsRemaining
    });

    setProgress(Math.min((elapsed / totalDuration) * 100, 100));
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Start</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  if (!timeRemaining) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Program Timeline
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

  const isCompleted = status === 'completed' || (timeRemaining.weeks === 0 && timeRemaining.days === 0 && timeRemaining.hours === 0);
  const isPending = new Date() < new Date(startDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Program Timeline
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Remaining */}
        {!isCompleted && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              {isPending ? (
                <>
                  <Calendar className="h-4 w-4" />
                  Starts In
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Time Remaining
                </>
              )}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeRemaining.weeks > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{timeRemaining.weeks}</div>
                  <div className="text-xs text-muted-foreground">Weeks</div>
                </div>
              )}
              {timeRemaining.days > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{timeRemaining.days}</div>
                  <div className="text-xs text-muted-foreground">Days</div>
                </div>
              )}
              {timeRemaining.hours > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{timeRemaining.hours}</div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
              )}
              {timeRemaining.minutes > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{timeRemaining.minutes}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Status */}
        {isCompleted && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Program Completed!</div>
              <div className="text-sm text-green-600">
                Congratulations on completing your {durationWeeks}-week program
              </div>
            </div>
          </div>
        )}

        {/* Program Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Duration</div>
            <div className="font-medium">{durationWeeks} weeks</div>
          </div>
          <div>
            <div className="text-muted-foreground">Start Date</div>
            <div className="font-medium">
              {new Date(startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">End Date</div>
            <div className="font-medium">
              {new Date(new Date(startDate).getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium capitalize">{status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
