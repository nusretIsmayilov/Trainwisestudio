/**
 * Mutation Queue Manager
 * Handles queuing, processing, and retrying mutations
 */

import { supabase } from '@/integrations/supabase/client';
import type { MutationOperation, MutationQueueConfig, QueueStats } from './types';
import { saveMutation, getMutations, deleteMutation, clearCompletedMutations, getQueueStats as getStats } from './storage';

const DEFAULT_CONFIG: Required<MutationQueueConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  batchSize: 10,
  batchDelay: 100, // 100ms between batches
  enableOfflineQueue: true,
};

class MutationQueue {
  private config: Required<MutationQueueConfig>;
  private processing = false;
  private processingInterval: number | null = null;
  private onlineHandler?: () => void;
  private offlineHandler?: () => void;

  constructor(config: MutationQueueConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupOnlineListeners();
  }

  private setupOnlineListeners() {
    if (typeof window === 'undefined') return;

    this.onlineHandler = () => {
      console.log('[MutationQueue] Online - processing queue');
      this.processQueue();
    };

    this.offlineHandler = () => {
      console.log('[MutationQueue] Offline - queueing mutations');
    };

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  /**
   * Add a mutation to the queue
   */
  async enqueue(operation: Omit<MutationOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    const id = `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mutation: MutationOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      maxRetries: operation.maxRetries || this.config.maxRetries,
    };

    await saveMutation(mutation);

    // Process immediately if online, otherwise queue for later
    if (this.isOnline()) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Process pending mutations
   */
  async processQueue(): Promise<void> {
    if (this.processing) return;
    if (!this.isOnline() && this.config.enableOfflineQueue) return;

    this.processing = true;

    try {
      const pending = await getMutations('pending');
      if (pending.length === 0) {
        this.processing = false;
        return;
      }

      // Process in batches
      const batches = [];
      for (let i = 0; i < pending.length; i += this.config.batchSize) {
        batches.push(pending.slice(i, i + this.config.batchSize));
      }

      for (const batch of batches) {
        await Promise.allSettled(batch.map((mutation) => this.processMutation(mutation)));
        // Small delay between batches to avoid overwhelming the server
        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, this.config.batchDelay));
        }
      }

      // Clean up old completed mutations (keep last 100)
      const completed = await getMutations('completed');
      if (completed.length > 100) {
        const toDelete = completed
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, completed.length - 100);
        await Promise.all(toDelete.map((m) => deleteMutation(m.id)));
      }
    } catch (error) {
      console.error('[MutationQueue] Error processing queue:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single mutation
   */
  private async processMutation(mutation: MutationOperation): Promise<void> {
    // Update status to processing
    mutation.status = 'processing';
    await saveMutation(mutation);

    try {
      let result: any;

      switch (mutation.type) {
        case 'insert':
          result = await this.executeInsert(mutation);
          break;
        case 'update':
          result = await this.executeUpdate(mutation);
          break;
        case 'delete':
          result = await this.executeDelete(mutation);
          break;
        case 'upsert':
          result = await this.executeUpsert(mutation);
          break;
        case 'rpc':
          result = await this.executeRpc(mutation);
          break;
        default:
          throw new Error(`Unknown mutation type: ${mutation.type}`);
      }

      mutation.status = 'completed';
      await saveMutation(mutation);

      // Delete after successful completion (with delay for debugging)
      setTimeout(() => deleteMutation(mutation.id), 5000);
    } catch (error: any) {
      mutation.retryCount++;
      mutation.error = error.message || String(error);

      if (mutation.retryCount >= mutation.maxRetries) {
        mutation.status = 'failed';
        console.error(`[MutationQueue] Mutation failed after ${mutation.retryCount} retries:`, mutation);
      } else {
        mutation.status = 'retrying';
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, mutation.retryCount - 1);
        setTimeout(() => {
          mutation.status = 'pending';
          saveMutation(mutation).then(() => this.processQueue());
        }, delay);
      }

      await saveMutation(mutation);
    }
  }

  private async executeInsert(mutation: MutationOperation) {
    let query: any = supabase.from(mutation.table).insert(mutation.payload);
    if (mutation.filters?.select) {
      query = query.select(mutation.filters.select);
    } else {
      query = query.select();
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  private async executeUpdate(mutation: MutationOperation) {
    if (!mutation.filters) {
      throw new Error('Update mutations require filters');
    }
    let query: any = supabase.from(mutation.table).update(mutation.payload);
    
    // Apply filters
    Object.entries(mutation.filters).forEach(([key, value]) => {
      if (key !== 'select') {
        query = query.eq(key, value);
      }
    });

    if (mutation.filters.select) {
      query = query.select(mutation.filters.select);
    } else {
      query = query.select();
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  private async executeDelete(mutation: MutationOperation) {
    if (!mutation.filters) {
      throw new Error('Delete mutations require filters');
    }
    let query: any = supabase.from(mutation.table).delete();
    
    // Apply filters
    Object.entries(mutation.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  private async executeUpsert(mutation: MutationOperation) {
    const onConflict = mutation.filters?.onConflict || 'id';
    let query: any = supabase.from(mutation.table).upsert(mutation.payload, { onConflict });
    
    if (mutation.filters?.select) {
      query = query.select(mutation.filters.select);
    } else {
      query = query.select();
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  private async executeRpc(mutation: MutationOperation) {
    const { function: func, params } = mutation.payload;
    const { data, error } = await supabase.rpc(func, params || {});
    if (error) throw error;
    return data;
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    return getStats();
  }

  /**
   * Retry failed mutations
   */
  async retryFailed(): Promise<void> {
    const failed = await getMutations('failed');
    for (const mutation of failed) {
      mutation.status = 'pending';
      mutation.retryCount = 0;
      mutation.error = undefined;
      await saveMutation(mutation);
    }
    await this.processQueue();
  }

  /**
   * Clear all mutations (use with caution)
   */
  async clear(): Promise<void> {
    const all = await getMutations();
    await Promise.all(all.map((m) => deleteMutation(m.id)));
  }

  /**
   * Start automatic processing
   */
  startAutoProcessing(intervalMs: number = 5000): void {
    if (this.processingInterval) return;
    this.processingInterval = window.setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Stop automatic processing
   */
  stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoProcessing();
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
    }
    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
    }
  }
}

// Singleton instance
let queueInstance: MutationQueue | null = null;

export function getMutationQueue(config?: MutationQueueConfig): MutationQueue {
  if (!queueInstance) {
    queueInstance = new MutationQueue(config);
    // Start auto-processing every 5 seconds
    queueInstance.startAutoProcessing(5000);
  }
  return queueInstance;
}

