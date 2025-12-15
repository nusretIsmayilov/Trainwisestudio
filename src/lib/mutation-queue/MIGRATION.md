# Migration Guide: Adding Mutation Queue Support

This guide helps you migrate existing hooks to use the mutation queue system for offline support and scalability.

## Step-by-Step Migration

### Step 1: Identify Direct Supabase Mutations

Look for patterns like:
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert/update/delete/upsert(...)
```

### Step 2: Import Required Hooks

```typescript
import { useTableMutations } from '@/hooks/useMutationQueue';
import { queryKeys } from '@/lib/query-config';
```

### Step 3: Replace Direct Calls

**Before:**
```typescript
const { data, error } = await supabase
  .from('programs')
  .insert({ name: 'New Program' });
if (error) throw error;
```

**After:**
```typescript
const { insert } = useTableMutations('programs');
await insert(
  { name: 'New Program' },
  {
    invalidateQueries: [queryKeys.programs()],
  }
);
```

### Step 4: Handle Updates

**Before:**
```typescript
const { data, error } = await supabase
  .from('programs')
  .update({ name: 'Updated' })
  .eq('id', programId);
```

**After:**
```typescript
const { update } = useTableMutations('programs');
await update(
  { name: 'Updated' },
  { id: programId },
  {
    invalidateQueries: [queryKeys.program(programId)],
  }
);
```

### Step 5: Handle Deletes

**Before:**
```typescript
const { error } = await supabase
  .from('programs')
  .delete()
  .eq('id', programId);
```

**After:**
```typescript
const { remove } = useTableMutations('programs');
await remove(
  { id: programId },
  {
    invalidateQueries: [queryKeys.programs()],
  }
);
```

### Step 6: Handle Upserts

**Before:**
```typescript
const { data, error } = await supabase
  .from('program_entries')
  .upsert(payload, { onConflict: 'user_id,date' });
```

**After:**
```typescript
const { upsert } = useTableMutations('program_entries');
await upsert(
  payload,
  'user_id,date',
  {
    invalidateQueries: [queryKeys.programEntries()],
  }
);
```

## Complete Example

### Before
```typescript
export const useProgramMutations = () => {
  const createProgram = async (data: CreateProgramData) => {
    const { data: result, error } = await supabase
      .from('programs')
      .insert({
        name: data.name,
        description: data.description,
        // ...
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  };

  const updateProgram = async (data: UpdateProgramData) => {
    const { data: result, error } = await supabase
      .from('programs')
      .update({
        name: data.name,
        // ...
      })
      .eq('id', data.id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  };

  return { createProgram, updateProgram };
};
```

### After
```typescript
import { useTableMutations } from '@/hooks/useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export const useProgramMutations = () => {
  const { insert, update } = useTableMutations('programs');

  const createProgram = async (data: CreateProgramData) => {
    await insert(
      {
        name: data.name,
        description: data.description,
        // ...
      },
      {
        invalidateQueries: [queryKeys.programs()],
      }
    );
    
    // Queue handles the actual insert, return optimistic data
    return {
      id: `temp_${Date.now()}`,
      name: data.name,
      // ...
    };
  };

  const updateProgram = async (data: UpdateProgramData) => {
    await update(
      {
        name: data.name,
        // ...
      },
      { id: data.id },
      {
        invalidateQueries: [
          queryKeys.program(data.id),
          queryKeys.programs(),
        ],
      }
    );
    
    // Return optimistic data
    return {
      id: data.id,
      name: data.name,
      // ...
    };
  };

  return { createProgram, updateProgram };
};
```

## Benefits After Migration

1. ✅ **Offline Support**: Mutations work even when offline
2. ✅ **Automatic Retry**: Failed mutations are retried automatically
3. ✅ **Better UX**: Users see immediate feedback (optimistic updates)
4. ✅ **Scalability**: Batch processing handles high traffic
5. ✅ **Persistence**: Mutations survive page reloads
6. ✅ **Cache Sync**: Automatic query invalidation keeps UI in sync

## Testing Offline Behavior

1. Open browser DevTools → Network tab
2. Set throttling to "Offline"
3. Perform a mutation
4. Check that it's queued (use `useMutationQueue().stats`)
5. Go back online
6. Verify mutation is processed automatically

## Rollback Strategy

If you need to rollback, you can:
1. Keep the old direct Supabase calls as fallback
2. Use `useQueue: false` option to bypass queue
3. Gradually migrate one hook at a time

## Common Patterns

### Pattern 1: Simple Insert
```typescript
const { insert } = useTableMutations('table');
await insert(data, { invalidateQueries: [queryKeys.table()] });
```

### Pattern 2: Update with Filters
```typescript
const { update } = useTableMutations('table');
await update(
  { field: 'value' },
  { id: recordId },
  { invalidateQueries: [queryKeys.record(recordId)] }
);
```

### Pattern 3: Conditional Queue Usage
```typescript
const { mutate } = useMutationQueue();
const { isOnline } = useMutationQueue();

// Use queue only when offline
if (!isOnline) {
  await mutate('insert', 'table', data);
} else {
  // Direct call for immediate feedback
  await supabase.from('table').insert(data);
}
```

## Next Steps

1. Start with high-traffic mutations (program entries, check-ins)
2. Add queue status indicator to UI
3. Monitor queue stats in production
4. Gradually migrate all mutations

