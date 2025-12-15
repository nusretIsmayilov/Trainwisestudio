import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionData {
  extensionAvailable: boolean;
  weeksElapsed: number;
  totalWeeks: number;
  weeksRemaining: number;
  percentageRemaining: number;
  reason: string;
}

interface ExtensionRequest {
  programId: string;
  extensionWeeks: number;
  coachId: string;
  customerId: string;
}

export const ContractExtension = ({ programId, coachId, customerId }: ExtensionRequest) => {
  const [extensionData, setExtensionData] = useState<ExtensionData | null>(null);
  const [extensionWeeks, setExtensionWeeks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    checkExtensionAvailability();
  }, [programId]);

  const getAuthHeaders = async () => {
    const { config } = await import('@/lib/config');
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'apikey': config.supabase.anonKey,
    };
  };

  const checkExtensionAvailability = async () => {
    try {
      setLoading(true);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/contract-extension?programId=${programId}`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to check extension availability');
      
      const data = await response.json();
      setExtensionData(data);
    } catch (error) {
      console.error('Error checking extension availability:', error);
      toast.error('Failed to check extension availability');
    } finally {
      setLoading(false);
    }
  };

  const requestExtension = async () => {
    if (!extensionWeeks || extensionWeeks <= 0) {
      toast.error('Please enter a valid number of weeks');
      return;
    }

    try {
      setRequesting(true);
      const { config } = await import('@/lib/config');
      const headers = await getAuthHeaders();
      const response = await fetch(`${config.api.baseUrl}/contract-extension`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          programId,
          extensionWeeks,
          coachId,
          customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request extension');
      }

      const data = await response.json();
      toast.success('Extension request submitted successfully');
      
      // Refresh extension data
      await checkExtensionAvailability();
    } catch (error) {
      console.error('Error requesting extension:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to request extension');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract Extension
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

  if (!extensionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract Extension
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load extension information
          </p>
        </CardContent>
      </Card>
    );
  }

  const { extensionAvailable, weeksElapsed, totalWeeks, weeksRemaining, percentageRemaining } = extensionData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contract Extension
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Program Progress</span>
            <span>{percentageRemaining}% remaining</span>
          </div>
          <Progress value={100 - percentageRemaining} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{weeksElapsed} weeks completed</span>
            <span>{weeksRemaining} weeks remaining</span>
          </div>
        </div>

        {/* Extension Status */}
        <div className="flex items-center gap-2">
          {extensionAvailable ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Extension Available
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Extension Not Yet Available
            </Badge>
          )}
        </div>

        {/* Extension Request Form */}
        {extensionAvailable && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="extensionWeeks">Extension Duration (weeks)</Label>
              <Input
                id="extensionWeeks"
                type="number"
                min="1"
                max={weeksRemaining}
                value={extensionWeeks}
                onChange={(e) => setExtensionWeeks(parseInt(e.target.value) || 1)}
                className="max-w-32"
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {weeksRemaining} weeks
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>
                Extension price will be calculated based on remaining program duration
              </span>
            </div>

            <Button 
              onClick={requestExtension}
              disabled={requesting || !extensionWeeks}
              className="w-full"
            >
              {requesting ? 'Requesting...' : 'Request Extension'}
            </Button>
          </div>
        )}

        {/* Not Available Message */}
        {!extensionAvailable && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="text-sm text-amber-700">
              Extension will be available when 20% or less of the program remains
            </div>
          </div>
        )}

        {/* Program Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Program Timeline</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Duration</div>
              <div className="font-medium">{totalWeeks} weeks</div>
            </div>
            <div>
              <div className="text-muted-foreground">Completed</div>
              <div className="font-medium">{weeksElapsed} weeks</div>
            </div>
            <div>
              <div className="text-muted-foreground">Remaining</div>
              <div className="font-medium">{weeksRemaining} weeks</div>
            </div>
            <div>
              <div className="text-muted-foreground">Progress</div>
              <div className="font-medium">{Math.round(100 - percentageRemaining)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
