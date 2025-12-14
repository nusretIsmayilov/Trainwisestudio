import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { useDailyCheckins } from '@/hooks/useDailyCheckins';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Lightweight inline prompt to capture today's check-in quickly
const DailyCheckinPrompt = () => {
  const { profile } = useAuth();
  const { planStatus } = usePaymentPlan();
  const { checkins, upsertToday } = useDailyCheckins();
  const [open, setOpen] = useState(false);
  const [water, setWater] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [energy, setEnergy] = useState<string>('');
  const [sleep, setSleep] = useState<string>('');

  const hasAccess = planStatus.hasActivePlan || Boolean(profile?.coach_id);
  const today = new Date().toISOString().slice(0, 10);
  const hasToday = useMemo(() => checkins.some(c => c.date.slice(0,10) === today), [checkins, today]);

  useEffect(() => {
    if (hasAccess && !hasToday) {
      setOpen(true);
    }
  }, [hasAccess, hasToday]);

  if (!open) return null;

  const submit = async () => {
    await upsertToday({
      water_liters: water ? Number(water) : null,
      mood: mood ? Number(mood) : null,
      energy: energy ? Number(energy) : null,
      sleep_hours: sleep ? Number(sleep) : null,
    });
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/30">
      <Card className="w-full max-w-md bg-white p-4 space-y-3">
        <div className="font-semibold text-lg">Daily Check-in</div>
        <p className="text-sm text-muted-foreground">Quickly log your day to track progress.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="water">Water (liters)</Label>
            <Input id="water" value={water} onChange={e => setWater(e.target.value)} placeholder="e.g., 2.0" />
          </div>
          <div>
            <Label htmlFor="sleep">Sleep (hours)</Label>
            <Input id="sleep" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="e.g., 7.5" />
          </div>
          <div>
            <Label htmlFor="mood">Mood (1-5)</Label>
            <Input id="mood" value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g., 4" />
          </div>
          <div>
            <Label htmlFor="energy">Energy (1-5)</Label>
            <Input id="energy" value={energy} onChange={e => setEnergy(e.target.value)} placeholder="e.g., 3" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Later</Button>
          <Button onClick={submit}>Save</Button>
        </div>
      </Card>
    </div>
  );
};

export default DailyCheckinPrompt;


