import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientStatusData {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  avatar_url: string;
  coach_id: string | null;
  status: 'no_status' | 'waiting_offer' | 'missing_program' | 'program_active' | 'on_track' | 'off_track' | 'soon_to_expire';
  badges: {
    new_message: boolean;
    awaiting_checkin: boolean;
    new_feedback: boolean;
  };
  program_data?: {
    assigned_programs: number;
    completed_programs: number;
    missed_days: number;
    days_until_expiry: number;
  };
  last_activity?: {
    last_message_at: string;
    last_checkin_response: string;
    last_program_entry: string;
  };
}

export const useRealTimeClientStatus = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientStatuses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all clients assigned to this coach
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, plan, avatar_url, coach_id, plan_expiry')
        .eq('coach_id', user.id)
        .eq('role', 'customer');

      if (profilesError) throw profilesError;

      const clientStatuses: ClientStatusData[] = [];

      for (const client of clientProfiles || []) {
        // Check if client has sent a request (no status)
        const { data: request } = await supabase
          .from('coach_requests')
          .select('id')
          .eq('customer_id', client.id)
          .eq('coach_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (request) {
          // Client has sent request but not accepted yet - no status
          clientStatuses.push({
            id: client.id,
            full_name: client.full_name,
            email: client.email,
            plan: client.plan,
            avatar_url: client.avatar_url,
            coach_id: client.coach_id,
            status: 'no_status',
            badges: {
              new_message: false,
              awaiting_checkin: false,
              new_feedback: false
            }
          });
          continue;
        }

        // Check for pending offers
        const { data: pendingOffer } = await supabase
          .from('coach_offers')
          .select('id, status')
          .eq('customer_id', client.id)
          .eq('coach_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (pendingOffer) {
          // Client has accepted request but no offer sent yet
          clientStatuses.push({
            id: client.id,
            full_name: client.full_name,
            email: client.email,
            plan: client.plan,
            avatar_url: client.avatar_url,
            coach_id: client.coach_id,
            status: 'waiting_offer',
            badges: {
              new_message: false,
              awaiting_checkin: false,
              new_feedback: false
            }
          });
          continue;
        }

        // Check for accepted offers but no programs
        const { data: acceptedOffer } = await supabase
          .from('coach_offers')
          .select('id, status')
          .eq('customer_id', client.id)
          .eq('coach_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle();

        if (acceptedOffer) {
          // Check if client has any assigned programs
          const { data: assignedPrograms } = await supabase
            .from('programs')
            .select('id, status')
            .eq('coach_id', user.id)
            .eq('assigned_to', client.id)
            .in('status', ['active', 'scheduled']);

          if (!assignedPrograms || assignedPrograms.length === 0) {
            // Client has accepted offer but no programs assigned
            clientStatuses.push({
              id: client.id,
              full_name: client.full_name,
              email: client.email,
              plan: client.plan,
              avatar_url: client.avatar_url,
              coach_id: client.coach_id,
              status: 'missing_program',
              badges: {
                new_message: false,
                awaiting_checkin: false,
                new_feedback: false
              }
            });
            continue;
          }
        }

        // Check program status and activity
        const { data: programs } = await supabase
          .from('programs')
          .select('id, status, created_at')
          .eq('coach_id', user.id)
          .eq('assigned_to', client.id);

        const { data: programEntries } = await supabase
          .from('program_entries')
          .select('created_at')
          .eq('user_id', client.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });

        // Check for missed days (more than 5 consecutive days)
        let missedDays = 0;
        if (programEntries && programEntries.length > 0) {
          const lastEntry = new Date(programEntries[0].created_at);
          const daysSinceLastEntry = Math.floor((Date.now() - lastEntry.getTime()) / (24 * 60 * 60 * 1000));
          if (daysSinceLastEntry > 5) {
            missedDays = daysSinceLastEntry;
          }
        }

        // Check plan expiry (20% of period remaining)
        let daysUntilExpiry = 0;
        if (client.plan_expiry) {
          const expiryDate = new Date(client.plan_expiry);
          const totalDays = 30; // Assuming 30-day plans
          const daysRemaining = Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
          const percentageRemaining = (daysRemaining / totalDays) * 100;
          
          if (percentageRemaining <= 20 && percentageRemaining > 0) {
            daysUntilExpiry = daysRemaining;
          }
        }

        // Determine status based on program activity
        let status: ClientStatusData['status'] = 'program_active';
        
        if (missedDays > 5) {
          status = 'off_track';
        } else if (programEntries && programEntries.length > 0) {
          status = 'on_track';
        }
        
        if (daysUntilExpiry > 0) {
          status = 'soon_to_expire';
        }

        // Check for badges
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('created_at, sender_id')
          .eq('conversation_id', (
            await supabase
              .from('conversations')
              .select('id')
              .eq('coach_id', user.id)
              .eq('customer_id', client.id)
              .single()
          ).data?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: checkinPins } = await supabase
          .from('coach_checkins')
          .select('id, status, created_at')
          .eq('customer_id', client.id)
          .eq('coach_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: checkinResponses } = await supabase
          .from('coach_checkins')
          .select('id, status, created_at')
          .eq('customer_id', client.id)
          .eq('coach_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const newMessage = lastMessage && 
          lastMessage.sender_id !== user.id && 
          new Date(lastMessage.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

        const awaitingCheckin = checkinPins && 
          checkinPins.status === 'pending' &&
          new Date(checkinPins.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000);

        const newFeedback = checkinResponses && 
          new Date(checkinResponses.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

        clientStatuses.push({
          id: client.id,
          full_name: client.full_name,
          email: client.email,
          plan: client.plan,
          avatar_url: client.avatar_url,
          coach_id: client.coach_id,
          status,
          badges: {
            new_message: !!newMessage,
            awaiting_checkin: !!awaitingCheckin,
            new_feedback: !!newFeedback
          },
          program_data: {
            assigned_programs: programs?.length || 0,
            completed_programs: programs?.filter(p => p.status === 'completed').length || 0,
            missed_days: missedDays,
            days_until_expiry: daysUntilExpiry
          },
          last_activity: {
            last_message_at: lastMessage?.created_at,
            last_checkin_response: checkinResponses?.created_at,
            last_program_entry: programEntries?.[0]?.created_at
          }
        });
      }

      setClients(clientStatuses);
    } catch (error) {
      console.error('Error fetching client statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStatuses();
  }, [user]);

  return {
    clients,
    loading,
    refreshStatuses: fetchClientStatuses
  };
};
