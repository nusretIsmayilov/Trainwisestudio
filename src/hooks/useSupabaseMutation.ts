/**
 * React Hook for Supabase Mutations with Queue Support
 * Wraps Supabase operations to use mutation queue for offline support
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMutationQueue } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';
import type { MutationType } from '@/lib/mutation-queue';

interface UseSupabaseMutationOptions<TData = any, TVariables = any> {
  table: string;
  type?: MutationType;
  queryKey?: readonly (string | Record<string, any>)[];
  invalidateQueries?: readonly (readonly (string | Record<string, any>)[])[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  useQueue?: boolean; // Whether to use mutation queue (default: true for offline support)
}

/**
 * Hook for Supabase mutations with automatic queue support
 * 
 * @example
 * const { mutate: createProgram } = useSupabaseMutation({
 *   table: 'programs',
 *   type: 'insert',
 *   queryKey: queryKeys.programs(),
 * });
 * 
 * createProgram({ name: 'New Program', ... });
 */
export function useSupabaseMutation<TData = any, TVariables = any>(
  options: UseSupabaseMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { mutate: queueMutate, isOnline } = useMutationQueue();
  const useQueue = options.useQueue !== false; // Default to true

  const executeMutation = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (useQueue && (!isOnline || options.type)) {
        // Use queue for offline support or when explicitly requested
        const mutationId = await queueMutate(
          options.type || 'insert',
          options.table,
          variables as any,
          {
            queryKey: options.queryKey?.[0] ? options.queryKey : undefined,
            invalidateQueries: options.invalidateQueries,
          }
        );
        // Return a promise that resolves when mutation is processed
        // In practice, the queue will handle this asynchronously
        return {} as TData; // Optimistic return
      }

      // Direct execution when online and queue not needed
      let result: any;
      const { type = 'insert' } = options;

      switch (type) {
        case 'insert': {
          const { data, error } = await supabase
            .from(options.table)
            .insert(variables as any)
            .select();
          if (error) throw error;
          result = data;
          break;
        }
        case 'update': {
          if (!variables || typeof variables !== 'object' || !('filters' in variables)) {
            throw new Error('Update mutations require filters');
          }
          const vars = variables as unknown as { filters: Record<string, any>; payload: any };
          let query: any = supabase.from(options.table).update(vars.payload);
          Object.entries(vars.filters).forEach(([key, value]) => {
            if (key !== 'select') {
              query = query.eq(key, value);
            }
          });
          const { data, error } = await query.select();
          if (error) throw error;
          result = data;
          break;
        }
        case 'delete': {
          if (!variables || typeof variables !== 'object' || !('filters' in variables)) {
            throw new Error('Delete mutations require filters');
          }
          const vars = variables as unknown as { filters: Record<string, any> };
          let query: any = supabase.from(options.table).delete();
          Object.entries(vars.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
          const { data, error } = await query;
          if (error) throw error;
          result = data;
          break;
        }
        case 'upsert': {
          const { payload, onConflict = 'id' } = variables as any;
          const { data, error } = await supabase
            .from(options.table)
            .upsert(payload, { onConflict })
            .select();
          if (error) throw error;
          result = data;
          break;
        }
        default:
          throw new Error(`Unsupported mutation type: ${type}`);
      }

      // Invalidate queries after successful mutation
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else if (options.queryKey) {
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      }

      return result as TData;
    },
    [options, useQueue, isOnline, queueMutate, queryClient]
  );

  return useMutation({
    mutationFn: executeMutation,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

