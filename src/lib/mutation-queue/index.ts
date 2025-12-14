/**
 * Mutation Queue - Main Export
 * 
 * Provides offline mutation support and automatic retry for scalability
 */

import { getMutationQueue } from './queue';
import type { MutationType, MutationOperation, MutationQueueConfig, QueueStats, MutationStatus } from './types';
export { getMutationQueue } from './queue';
export type { MutationOperation, MutationQueueConfig, QueueStats, MutationType, MutationStatus } from './types';
export { getQueueStats, clearCompletedMutations } from './storage';

/**
 * Helper to create a mutation operation
 */
export async function queueMutation(
  type: MutationType,
  table: string,
  payload: any,
  options?: {
    filters?: Record<string, any>;
    queryKey?: string[];
    maxRetries?: number;
    optimisticUpdate?: (data: any) => any;
  }
): Promise<string> {
  const queue = getMutationQueue();
  return queue.enqueue({
    type,
    table,
    payload,
    filters: options?.filters,
    queryKey: options?.queryKey,
    maxRetries: options?.maxRetries,
    optimisticUpdate: options?.optimisticUpdate,
  });
}

/**
 * Convenience functions for common operations
 */
export const queueInsert = (table: string, payload: any, options?: Parameters<typeof queueMutation>[3]) =>
  queueMutation('insert', table, payload, options);

export const queueUpdate = (
  table: string,
  payload: any,
  filters: Record<string, any>,
  options?: Parameters<typeof queueMutation>[3]
) => queueMutation('update', table, payload, { ...options, filters });

export const queueDelete = (table: string, filters: Record<string, any>, options?: Parameters<typeof queueMutation>[3]) =>
  queueMutation('delete', table, {}, { ...options, filters });

export const queueUpsert = (
  table: string,
  payload: any,
  onConflict: string = 'id',
  options?: Parameters<typeof queueMutation>[3]
) => queueMutation('upsert', table, payload, { ...options, filters: { onConflict } });

