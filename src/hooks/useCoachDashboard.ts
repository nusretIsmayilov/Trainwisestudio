import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalClients: number;
  totalEarning: number; // dollars
  activePrograms: number;
  retentionRate: number; // percent 0-100
}

export const useCoachDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, totalEarning: 0, activePrograms: 0, retentionRate: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // total clients assigned to this coach
        const { count: totalClients } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('coach_id', user.id)
          .eq('role', 'customer');

        // total earning from payouts (net)
        const { data: payoutRows } = await supabase
          .from('payouts')
          .select('net_amount_cents')
          .eq('coach_id', user.id);
        const totalNetCents = (payoutRows || []).reduce((acc, r: any) => acc + (r.net_amount_cents || 0), 0);

        // active programs count
        const { count: activePrograms } = await supabase
          .from('programs')
          .select('id', { count: 'exact', head: true })
          .eq('coach_id', user.id)
          .eq('status', 'active');

        // simple retention heuristic: customers with non-null plan among all clients
        const { data: clientPlans } = await supabase
          .from('profiles')
          .select('id, plan')
          .eq('coach_id', user.id)
          .eq('role', 'customer');
        const withPlan = (clientPlans || []).filter((p: any) => !!p.plan).length;
        const total = totalClients || (clientPlans?.length || 0);
        const retentionRate = total > 0 ? Math.round((withPlan / total) * 100) : 0;

        setStats({
          totalClients: totalClients || 0,
          totalEarning: Math.round((totalNetCents / 100) * 100) / 100,
          activePrograms: activePrograms || 0,
          retentionRate,
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return { stats, loading, error };
};

export interface CoachTask {
  id: string;
  clientId?: string;
  clientName?: string | null;
  task: string;
  details?: string;
  tag?: string;
  color?: string;
  link?: string;
}

export const useCoachTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const results: CoachTask[] = [];

        // Get all clients with their status
        const { data: clientProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, plan_expiry')
          .eq('coach_id', user.id)
          .eq('role', 'customer');

        for (const client of clientProfiles || []) {
          // Check for pending requests
          const { data: pendingRequest } = await supabase
            .from('coach_requests')
            .select('id')
            .eq('customer_id', client.id)
            .eq('coach_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          if (pendingRequest) {
            results.push({
              id: `request-${client.id}`,
              clientId: client.id,
              clientName: client.full_name,
              task: 'Review new client request',
              details: 'A new client has requested your coaching services.',
              tag: 'New Request',
              color: 'bg-green-500',
              link: `/coach/clients/${client.id}`,
            });
            continue;
          }

          // Check for waiting offers
          const { data: waitingOffer } = await supabase
            .from('coach_offers')
            .select('id')
            .eq('customer_id', client.id)
            .eq('coach_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          if (waitingOffer) {
            results.push({
              id: `offer-${client.id}`,
              clientId: client.id,
              clientName: client.full_name,
              task: 'Follow up on pending offer',
              details: 'Client has a pending offer that needs attention.',
              tag: 'Pending Offer',
              color: 'bg-orange-500',
              link: `/coach/messages`,
            });
            continue;
          }

          // Check for missing programs
          const { data: programs } = await supabase
            .from('programs')
            .select('id, status')
            .eq('coach_id', user.id)
            .eq('assigned_to', client.id)
            .in('status', ['active', 'scheduled']);

          if (!programs || programs.length === 0) {
            results.push({
              id: `noplan-${client.id}`,
              clientId: client.id,
              clientName: client.full_name,
              task: 'Assign a program',
              details: 'Client needs a program assigned to get started.',
              tag: 'Missing Program',
              color: 'bg-red-500',
              link: `/coach/clients/${client.id}`,
            });
            continue;
          }

          // Check for off-track clients (missed more than 5 days)
          const { data: lastEntry } = await supabase
            .from('program_entries')
            .select('created_at')
            .eq('user_id', client.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastEntry) {
            const daysSinceLastEntry = Math.floor((Date.now() - new Date(lastEntry.created_at).getTime()) / (24 * 60 * 60 * 1000));
            if (daysSinceLastEntry > 5) {
              results.push({
                id: `offtrack-${client.id}`,
                clientId: client.id,
                clientName: client.full_name,
                task: 'Client is off track',
                details: `Client hasn't logged progress in ${daysSinceLastEntry} days.`,
                tag: 'Off Track',
                color: 'bg-red-600',
                link: `/coach/clients/${client.id}`,
              });
              continue;
            }
          }

          // Check for soon-to-expire plans
          if (client.plan_expiry) {
            const expiryDate = new Date(client.plan_expiry);
            const daysRemaining = Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            const totalDays = 30; // Assuming 30-day plans
            const percentageRemaining = (daysRemaining / totalDays) * 100;
            
            if (percentageRemaining <= 20 && percentageRemaining > 0) {
              results.push({
                id: `renewal-${client.id}`,
                clientId: client.id,
                clientName: client.full_name,
                task: 'Plan expiring soon',
                details: `Client's plan expires in ${daysRemaining} days. Consider renewal.`,
                tag: 'Soon to Expire',
                color: 'bg-blue-500',
                link: `/coach/messages`,
              });
              continue;
            }
          }

          // Check for awaiting check-ins
          const { data: pendingCheckin } = await supabase
            .from('coach_checkins')
            .select('id, created_at')
            .eq('customer_id', client.id)
            .eq('coach_id', user.id)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (pendingCheckin) {
            const daysSinceCheckin = Math.floor((Date.now() - new Date(pendingCheckin.created_at).getTime()) / (24 * 60 * 60 * 1000));
            if (daysSinceCheckin > 1) {
              results.push({
                id: `checkin-${client.id}`,
                clientId: client.id,
                clientName: client.full_name,
                task: 'Awaiting check-in response',
                details: 'Client hasn\'t responded to your check-in.',
                tag: 'Awaiting Check-in',
                color: 'bg-yellow-500',
                link: `/coach/messages`,
              });
            }
          }
        }

        // Sort by priority and limit to 10 tasks
        const priorityOrder = {
          'New Request': 1,
          'Missing Program': 2,
          'Off Track': 3,
          'Awaiting Check-in': 4,
          'Pending Offer': 5,
          'Soon to Expire': 6
        };

        results.sort((a, b) => {
          const aPriority = priorityOrder[a.tag as keyof typeof priorityOrder] || 999;
          const bPriority = priorityOrder[b.tag as keyof typeof priorityOrder] || 999;
          return aPriority - bPriority;
        });

        setTasks(results.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return { tasks, loading };
};


