/**
 * React Hook for Mutation Queue
 * Provides easy access to queued mutations with React Query integration
 */

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMutationQueue, queueMutation, type QueueStats, type MutationType } from '@/lib/mutation-queue';
import { queryKeys } from '@/lib/query-config';

export function useMutationQueue() {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0,
  });
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const queue = getMutationQueue();

  // Update stats periodically
  useEffect(() => {
    const updateStats = async () => {
      const newStats = await queue.getStats();
      setStats(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [queue]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const mutate = useCallback(
    async (
      type: MutationType,
      table: string,
      payload: any,
      options?: {
        filters?: Record<string, any>;
        queryKey?: readonly (string | Record<string, any>)[];
        maxRetries?: number;
        invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[];
        optimisticUpdate?: (data: any) => any;
      }
    ) => {
      const mutationId = await queueMutation(type, table, payload, {
        filters: options?.filters,
        queryKey: options?.queryKey ? [...options.queryKey] as string[] : options?.invalidateQueries?.[0] ? [...options.invalidateQueries[0]] as string[] : undefined,
        maxRetries: options?.maxRetries,
        optimisticUpdate: options?.optimisticUpdate,
      });

      // Invalidate queries after mutation is queued
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [...key] });
        });
      }

      return mutationId;
    },
    [queryClient]
  );

  const retryFailed = useCallback(async () => {
    await queue.retryFailed();
    const newStats = await queue.getStats();
    setStats(newStats);
  }, [queue]);

  return {
    mutate,
    stats,
    isOnline,
    retryFailed,
    processQueue: () => queue.processQueue(),
  };
}

/**
 * Hook for specific table mutations
 */
export function useTableMutations(table: string) {
  const { mutate, stats, isOnline } = useMutationQueue();
  const queryClient = useQueryClient();

  const insert = useCallback(
    async (payload: any, options?: { queryKey?: readonly (string | Record<string, any>)[]; invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[] }) => {
      return mutate('insert', table, payload, {
        queryKey: options?.queryKey,
        invalidateQueries: options?.invalidateQueries || [[table]],
      });
    },
    [mutate, table]
  );

  const update = useCallback(
    async (
      payload: any,
      filters: Record<string, any>,
      options?: { queryKey?: readonly (string | Record<string, any>)[]; invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[] }
    ) => {
      return mutate('update', table, payload, {
        filters,
        queryKey: options?.queryKey,
        invalidateQueries: options?.invalidateQueries || [[table]],
      });
    },
    [mutate, table]
  );

  const remove = useCallback(
    async (filters: Record<string, any>, options?: { queryKey?: readonly (string | Record<string, any>)[]; invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[] }) => {
      return mutate('delete', table, {}, {
        filters,
        queryKey: options?.queryKey,
        invalidateQueries: options?.invalidateQueries || [[table]],
      });
    },
    [mutate, table]
  );

  const upsert = useCallback(
    async (
      payload: any,
      onConflict: string = 'id',
      options?: { queryKey?: readonly (string | Record<string, any>)[]; invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[] }
    ) => {
      return mutate('upsert', table, payload, {
        filters: { onConflict },
        queryKey: options?.queryKey,
        invalidateQueries: options?.invalidateQueries || [[table]],
      });
    },
    [mutate, table]
  );

  return {
    insert,
    update,
    remove,
    upsert,
    stats,
    isOnline,
  };
}

