# Mutation Queue System

A robust offline-first mutation queue system designed to handle 1M+ daily users with automatic retry, persistence, and query invalidation.

## Features

- ✅ **Offline Support**: Mutations are queued when offline and processed when connection is restored
- ✅ **IndexedDB Persistence**: Mutations survive page reloads and browser restarts
- ✅ **Automatic Retry**: Failed mutations are retried with exponential backoff
- ✅ **Batch Processing**: Mutations are processed in batches to avoid overwhelming the server
- ✅ **React Query Integration**: Automatic cache invalidation after successful mutations
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Scalable**: Designed for high-traffic applications

## Quick Start

### Basic Usage

```typescript
import { useTableMutations } from '@/hooks/useMutationQueue';
import { queryKeys } from '@/lib/query-config';

function MyComponent() {
  const { insert, update, remove, upsert, stats, isOnline } = useTableMutations('programs');

  const handleCreate = async () => {
    await insert(
      { name: 'New Program', description: '...' },
      {
        invalidateQueries: [queryKeys.programs()],
      }
    );
  };

  return (
    <div>
      {!isOnline && <div>Offline - {stats.pending} mutations queued</div>}
      <button onClick={handleCreate}>Create Program</button>
    </div>
  );
}
```

### Using with React Query Mutations

```typescript
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { queryKeys } from '@/lib/query-config';

function MyComponent() {
  const { mutate: createProgram, isPending } = useSupabaseMutation({
    table: 'programs',
    type: 'insert',
    queryKey: queryKeys.programs(),
    onSuccess: (data) => {
      console.log('Program created:', data);
    },
  });

  return (
    <button 
      onClick={() => createProgram({ name: 'New Program' })}
      disabled={isPending}
    >
      {isPending ? 'Creating...' : 'Create Program'}
    </button>
  );
}
```

### Direct Queue Access

```typescript
import { queueInsert, queueUpdate, queueDelete, queueUpsert } from '@/lib/mutation-queue';

// Queue an insert
await queueInsert('programs', { name: 'New Program' });

// Queue an update
await queueUpdate('programs', { name: 'Updated Name' }, { id: '123' });

// Queue a delete
await queueDelete('programs', { id: '123' });

// Queue an upsert
await queueUpsert('programs', { id: '123', name: 'Program' }, 'id');
```

## API Reference

### `useMutationQueue()`

Main hook for mutation queue operations.

**Returns:**
- `mutate`: Function to queue mutations
- `stats`: Current queue statistics
- `isOnline`: Online/offline status
- `retryFailed`: Function to retry failed mutations
- `processQueue`: Function to manually trigger queue processing

### `useTableMutations(table: string)`

Convenience hook for table-specific mutations.

**Returns:**
- `insert`: Queue an insert operation
- `update`: Queue an update operation
- `remove`: Queue a delete operation
- `upsert`: Queue an upsert operation
- `stats`: Queue statistics
- `isOnline`: Online/offline status

### `useSupabaseMutation(options)`

React Query mutation hook with queue support.

**Options:**
- `table`: Table name
- `type`: Mutation type ('insert' | 'update' | 'delete' | 'upsert')
- `queryKey`: Query key for cache invalidation
- `invalidateQueries`: Array of query keys to invalidate
- `onSuccess`: Success callback
- `onError`: Error callback
- `useQueue`: Whether to use queue (default: true)

## Configuration

The mutation queue can be configured when initializing:

```typescript
import { getMutationQueue } from '@/lib/mutation-queue';

const queue = getMutationQueue({
  maxRetries: 5,        // Maximum retry attempts
  retryDelay: 2000,     // Initial retry delay (ms)
  batchSize: 20,        // Mutations per batch
  batchDelay: 200,      // Delay between batches (ms)
  enableOfflineQueue: true, // Enable offline queuing
});
```

## Query Configuration

The query configuration in `src/lib/query-config.ts` provides:

- **Stale Time**: 5 minutes (data is considered fresh for 5 minutes)
- **Garbage Collection Time**: 10 minutes (unused data is kept for 10 minutes)
- **Retry Logic**: 3 retries with exponential backoff
- **Query Key Factories**: Consistent cache key generation

## Migration Guide

### Before (Direct Supabase Calls)

```typescript
const { data, error } = await supabase
  .from('programs')
  .insert({ name: 'New Program' });
```

### After (With Queue Support)

```typescript
const { insert } = useTableMutations('programs');
await insert({ name: 'New Program' }, {
  invalidateQueries: [queryKeys.programs()],
});
```

## Best Practices

1. **Always invalidate queries** after mutations to keep the UI in sync
2. **Use query key factories** from `queryKeys` for consistency
3. **Show queue status** to users when offline
4. **Handle errors gracefully** - failed mutations are stored and can be retried
5. **Use batch operations** when possible for better performance

## Monitoring

The queue provides statistics that can be displayed to users:

```typescript
const { stats } = useMutationQueue();

console.log({
  pending: stats.pending,      // Mutations waiting to be processed
  processing: stats.processing, // Mutations currently being processed
  completed: stats.completed,  // Successfully completed mutations
  failed: stats.failed,        // Failed mutations (can be retried)
  total: stats.total,          // Total mutations in queue
});
```

## Troubleshooting

### Mutations not processing

1. Check if you're online: `navigator.onLine`
2. Check queue stats: `useMutationQueue().stats`
3. Manually trigger processing: `queue.processQueue()`

### Failed mutations

1. Check error messages in queue stats
2. Retry failed mutations: `queue.retryFailed()`
3. Check network connectivity
4. Verify Supabase RLS policies allow the operation

### Performance issues

1. Reduce `batchSize` if server is overwhelmed
2. Increase `batchDelay` between batches
3. Clear old completed mutations periodically (automatic after 100)

## Architecture

```
┌─────────────────┐
│  React Component │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useMutationQueue│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Mutation Queue │◄────►│  IndexedDB   │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Supabase API  │
└─────────────────┘
```

The queue automatically:
1. Stores mutations in IndexedDB when queued
2. Processes mutations when online
3. Retries failed mutations with exponential backoff
4. Invalidates React Query cache after success
5. Cleans up old completed mutations

