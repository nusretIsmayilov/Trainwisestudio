/**
 * Mutation Queue Types
 * 
 * Supports offline writes and automatic retry for 1M+ daily users
 */

export type MutationType = 'insert' | 'update' | 'delete' | 'upsert' | 'rpc';

export type MutationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export interface MutationOperation {
  id: string;
  type: MutationType;
  table: string;
  payload: any;
  filters?: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: MutationStatus;
  error?: string;
  queryKey?: string[]; // For cache invalidation
  optimisticUpdate?: (data: any) => any; // For optimistic updates
}

export interface MutationQueueConfig {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  batchDelay?: number;
  enableOfflineQueue?: boolean;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

