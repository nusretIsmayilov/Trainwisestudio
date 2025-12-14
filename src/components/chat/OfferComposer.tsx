import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const offerSchema = z.object({
  price: z.number()
    .min(50, 'Price must be at least $50')
    .max(10000, 'Price cannot exceed $10,000'),
  duration: z.number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 month')
    .max(12, 'Duration cannot exceed 12 months'),
  message: z.string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
});

interface OfferComposerProps {
  onSend: (price: number, duration: number, message: string) => void;
  onCancel: () => void;
  sending?: boolean;
}

export const OfferComposer: React.FC<OfferComposerProps> = ({
  onSend,
  onCancel,
  sending = false
}) => {
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ price?: string; duration?: string; message?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(price);
    const durationNum = parseInt(duration);
    
    // Validate with Zod
    const result = offerSchema.safeParse({
      price: priceNum,
      duration: durationNum,
      message: message.trim()
    });

    if (!result.success) {
      const fieldErrors: { price?: string; duration?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as 'price' | 'duration' | 'message';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setErrors({});
    onSend(priceNum, durationNum, message.trim());
  };

  const isValid = price && duration && message.trim() && 
                  !isNaN(parseFloat(price)) && !isNaN(parseInt(duration)) &&
                  message.trim().length >= 5;

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            Send Coaching Offer
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={sending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="50"
                max="10000"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrors({ ...errors, price: undefined });
                }}
                placeholder="0.00"
                disabled={sending}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setErrors({ ...errors, duration: undefined });
                }}
                placeholder="3"
                disabled={sending}
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.duration}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="message" className="text-sm">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors({ ...errors, message: undefined });
              }}
              placeholder="Describe your coaching offer (5-1000 characters)..."
              rows={3}
              disabled={sending}
              maxLength={1000}
              className={`text-sm ${errors.message ? 'border-destructive' : ''}`}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mt-1">
              {errors.message && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.message}
                </p>
              )}
              <div className="ml-auto flex items-center gap-2">
                {message.trim().length > 0 && message.trim().length < 5 && (
                  <p className="text-xs text-amber-600">
                    {5 - message.trim().length} more
                  </p>
                )}
                <p className={`text-xs ${message.length > 900 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {message.length}/1000
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || sending}
            >
              {sending ? "Sending..." : "Send Offer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};