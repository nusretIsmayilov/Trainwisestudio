import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useProfileUpdates } from '@/hooks/useProfileUpdates';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ContactAndGoals = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const { updateProfile, loading } = useProfileUpdates();

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const { data: p } = await supabase
        .from('profiles')
        .select('email, phone, created_at')
        .eq('id', user.id)
        .single();
      setEmail(p?.email || '');
      setPhone((p as any)?.phone || '');
      setJoinedDate(p?.created_at || '');
      const { data: ob } = await supabase
        .from('onboarding_details')
        .select('location')
        .eq('user_id', user.id)
        .single();
      setLocation((ob as any)?.location || '');
    };
    run();
  }, [user]);

  const handleSave = async () => {
    try {
      const ok = await updateProfile({ phone });
      if (!ok) {
        toast.error('Failed to save profile');
        return;
      }
      // Also save location to onboarding_details
      const { error } = await supabase
        .from('onboarding_details')
        .upsert({ user_id: user?.id, location }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving location:', error);
        toast.error('Failed to save location');
        return;
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Contact & Personal Info</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{email}</span>
          </li>
          <li className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 shrink-0" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-8" />
          </li>
          <li className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex gap-2">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="h-8" />
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </li>
          <li className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{joinedDate ? new Date(joinedDate).toLocaleDateString() : ''}</span>
          </li>
        </ul>
      </Card>
      
    </div>
  );
};

export default ContactAndGoals;
