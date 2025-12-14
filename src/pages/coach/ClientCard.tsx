import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ClientHeader from '@/components/coach/clientCard/ClientHeader';
import ClientProfileTab from '@/components/coach/clientCard/tabs/ClientProfileTab';
import ProgressProgramsTab from '@/components/coach/clientCard/tabs/ProgressProgramsTab';
import CommunicationTab from '@/components/coach/clientCard/tabs/CommunicationTab';
import ClientActionButton from '@/components/coach/clientCard/ClientActionButton';

const ClientCard = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState<any>(null);
  useEffect(() => {
    const run = async () => {
      if (!clientId) return;
      
      // Load client profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, plan, plan_expiry, coach_id, phone')
        .eq('id', clientId)
        .maybeSingle();

      if (!profile) {
        console.error('Client not found');
        return;
      }

      // Load client onboarding details (personal info, goals, preferences)
      const { data: onboardingDetails } = await supabase
        .from('onboarding_details')
        .select('*')
        .eq('user_id', clientId)
        .maybeSingle();

      // Load programs assigned to client
      const { data: programs } = await supabase
        .from('programs')
        .select('id, name, status, scheduled_date')
        .eq('assigned_to', clientId)
        .order('created_at', { ascending: false });

      // Calculate age from date of birth
      const calculateAge = (dob: string | null) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      setClient({
        ...profile,
        // Personal info from onboarding_details
        personalInfo: {
          age: calculateAge(onboardingDetails?.dob || null),
          height: onboardingDetails?.height ? `${onboardingDetails.height} cm` : 'Not provided',
          weight: onboardingDetails?.weight ? `${onboardingDetails.weight} kg` : 'Not provided',
          gender: onboardingDetails?.gender || 'Not provided',
        },
        // Goals and preferences from onboarding_details
        goals: onboardingDetails?.goals || [],
        preferences: {
          injuries: onboardingDetails?.injuries || [],
          allergies: onboardingDetails?.allergies || [],
          dislikes: onboardingDetails?.training_dislikes || [],
          likes: onboardingDetails?.training_likes || [],
          meditationExperience: onboardingDetails?.meditation_experience || 'Not specified',
        },
        programs: (programs || []).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status as any,
          startDate: p.scheduled_date || undefined,
        })),
      });
    };
    run();
  }, [clientId]);

  return (
    <div className="relative w-full px-4 py-6 space-y-6">
      {/* Header */}
      <ClientHeader client={client} />

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full rounded-2xl bg-muted p-1 flex flex-col sm:flex-row gap-1 sm:gap-0 h-auto sm:h-10">
          <TabsTrigger
            value="profile"
            className="w-full rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs sm:text-sm font-medium py-3 sm:py-1.5 px-4 sm:px-3 h-auto"
          >
            <span className="hidden sm:inline">Client Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="w-full rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs sm:text-sm font-medium py-3 sm:py-1.5 px-4 sm:px-3 h-auto"
          >
            <span className="hidden sm:inline">Progress & Programs</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="w-full rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs sm:text-sm font-medium py-3 sm:py-1.5 px-4 sm:px-3 h-auto"
          >
            <span className="hidden sm:inline">Communication</span>
            <span className="sm:hidden">Messages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ClientProfileTab client={client} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressProgramsTab client={client} />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CommunicationTab client={client} />
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <ClientActionButton />
    </div>
  );
};

export default ClientCard;
