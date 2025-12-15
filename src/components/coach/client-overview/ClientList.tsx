import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import ClientCard from './ClientCard';
import ClientFilters from './ClientFilters';
import { useRealTimeClientStatus } from '@/hooks/useRealTimeClientStatus';

interface ClientRow { 
  id: string; 
  full_name: string | null; 
  plan: string | null; 
  avatar_url: string | null;
  isNewlyAccepted?: boolean;
}

interface ClientListProps {
  refreshTrigger?: number;
}

const ClientList = ({ refreshTrigger }: ClientListProps) => {
  const { user } = useAuth();
  const { clients: allClients, loading } = useRealTimeClientStatus();
  const [filteredClients, setFilteredClients] = useState(allClients);
  const [filters, setFilters] = useState<{
    status: string[];
    badges: string[];
  }>({ status: [], badges: [] });

  const applyFilters = (clients: any[], filters: { status: string[]; badges: string[] }) => {
    let filtered = clients;

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(client => filters.status.includes(client.status));
    }

    // Filter by badges
    if (filters.badges.length > 0) {
      filtered = filtered.filter(client => {
        return filters.badges.some(badge => client.badges[badge as keyof typeof client.badges]);
      });
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredClients(applyFilters(allClients, filters));
  }, [allClients, filters]);

  const handleFilterChange = (newFilters: { status: string[]; badges: string[] }) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">My Clients 🏋️</h2>
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground">Loading clients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Clients 🏋️</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredClients.length === allClients.length
              ? `${allClients.length} ${allClients.length === 1 ? 'client' : 'clients'}`
              : `Showing ${filteredClients.length} of ${allClients.length} ${allClients.length === 1 ? 'client' : 'clients'}`
            }
          </p>
        </div>
      </div>
      
      <ClientFilters 
        onFilterChange={handleFilterChange}
        totalCount={allClients.length}
        filteredCount={filteredClients.length}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClients.map((client, index) => (
          <ClientCard key={client.id} clientId={client.id} index={index} />
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-sm text-muted-foreground">
              {allClients.length === 0 
                ? "No clients yet. Accept requests to see them here."
                : "No clients match the current filters."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
