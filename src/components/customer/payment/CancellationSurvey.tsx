import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface CancellationSurveyProps {
  onSubmit: (data: { reason: string; feedback: string }) => void;
  onCancel: () => void;
}

const CancellationSurvey = ({ onSubmit, onCancel }: CancellationSurveyProps) => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const reasons = [
    { value: 'too-expensive', label: 'Too expensive' },
    { value: 'not-using', label: 'Not using enough' },
    { value: 'found-alternative', label: 'Found a better alternative' },
    { value: 'technical-issues', label: 'Technical issues' },
    { value: 'poor-support', label: 'Poor customer support' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    onSubmit({ reason, feedback });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
          <AlertTriangle className="h-5 w-5" />
          Help Us Improve
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          We’re sorry to see you go. Please help us understand why so we can improve.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm sm:text-base font-medium">
              What’s the main reason for cancelling?
            </Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {reasons.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer text-sm sm:text-base">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm sm:text-base font-medium">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:flex-1"
            >
              Keep My Subscription
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason}
              className="w-full sm:flex-1"
            >
              Continue Cancellation
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CancellationSurvey;
