# Next Steps: Mutation Queue Rollout Plan

## ✅ Completed
- [x] Mutation queue system implemented
- [x] React Query configuration optimized
- [x] Example migration: `useProgramEntries.ts`
- [x] Documentation and migration guides created

## 🎯 Immediate Next Steps (Priority Order)

### Phase 1: Testing & Validation (Do This First)

1. **Test the Current Implementation**
   ```bash
   # Run the app and test offline functionality
   npm run dev
   ```
   
   - Test `useProgramEntries` with:
     - ✅ Online: Complete a program entry
     - ✅ Offline: Complete an entry (should queue)
     - ✅ Go back online: Verify it syncs automatically
     - ✅ Check browser DevTools → Application → IndexedDB → `harmony-stride-mutations`

2. **Add Queue Status Indicator** (Optional but Recommended)
   - Create a component to show queue status in the UI
   - Helps users understand when mutations are queued

### Phase 2: High-Priority Migrations (Start Here)

These hooks are used frequently and should be migrated first:

1. **`useDailyCheckins.ts`** ⭐ HIGH PRIORITY
   - Users check in daily
   - High traffic mutation
   - Location: `src/hooks/useDailyCheckins.ts`

2. **`useProfileUpdates.ts`** ⭐ HIGH PRIORITY
   - Profile updates are common
   - Location: `src/hooks/useProfileUpdates.ts`

3. **`useProgramMutations.ts`** ⭐ HIGH PRIORITY
   - Program creation/updates
   - Location: `src/hooks/useProgramMutations.ts`

4. **`useWeightTracking.ts`**
   - Frequent weight entries
   - Location: `src/hooks/useWeightTracking.ts`

### Phase 3: Medium-Priority Migrations

5. **`useMessages.ts`**
   - Message sending
   - Location: `src/hooks/useMessages.ts`

6. **`useCoachLibrary.ts`**
   - Library item management
   - Location: `src/hooks/useCoachLibrary.ts`

7. **`useCoachBlog.ts`**
   - Blog post creation/updates
   - Location: `src/hooks/useCoachBlog.ts`

8. **`useProgressPhotos.ts`**
   - Photo uploads
   - Location: `src/hooks/useProgressPhotos.ts`

### Phase 4: Lower-Priority Migrations

9. `useCoachRequests.ts`
10. `useOfferActions.ts`
11. `useConversations.ts`
12. `useWelcomePDF.ts`
13. `useRealTimeCheckIns.ts`
14. `useCoachProfile.ts`
15. `useEnhancedCoaches.ts`
16. `usePaymentPlan.ts` (may need special handling for Stripe)

## 📋 Migration Checklist (For Each Hook)

When migrating a hook, follow this checklist:

- [ ] Import `useTableMutations` or `useMutationQueue`
- [ ] Import `queryKeys` from `@/lib/query-config`
- [ ] Replace direct Supabase calls with queue methods
- [ ] Add proper `invalidateQueries` for cache sync
- [ ] Test online behavior
- [ ] Test offline behavior
- [ ] Test retry behavior (simulate network failure)
- [ ] Verify optimistic updates work
- [ ] Check that UI updates correctly

## 🛠️ Quick Migration Template

```typescript
// BEFORE
const { data, error } = await supabase
  .from('table_name')
  .insert(payload);

// AFTER
import { useTableMutations } from '@/hooks/useMutationQueue';
import { queryKeys } from '@/lib/query-config';

const { insert } = useTableMutations('table_name');
await insert(payload, {
  invalidateQueries: [queryKeys.tableName()],
});
```

## 🎨 Optional: Add Queue Status UI

Create a component to show users when mutations are queued:

```typescript
// src/components/system/MutationQueueStatus.tsx
import { useMutationQueue } from '@/hooks/useMutationQueue';
import { AlertCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';

export function MutationQueueStatus() {
  const { stats, isOnline, retryFailed } = useMutationQueue();
  
  if (stats.pending === 0 && stats.failed === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Show queue status */}
    </div>
  );
}
```

## 📊 Monitoring & Optimization

1. **Monitor Queue Stats in Production**
   - Add logging for queue operations
   - Track success/failure rates
   - Monitor queue size

2. **Performance Tuning**
   - Adjust `batchSize` if needed (default: 10)
   - Adjust `batchDelay` if needed (default: 100ms)
   - Adjust `maxRetries` if needed (default: 3)

3. **Error Handling**
   - Monitor failed mutations
   - Set up alerts for high failure rates
   - Provide retry UI for users

## 🚀 Deployment Strategy

1. **Week 1**: Test with `useProgramEntries` (already done)
2. **Week 2**: Migrate Phase 2 hooks (high priority)
3. **Week 3**: Migrate Phase 3 hooks (medium priority)
4. **Week 4**: Migrate Phase 4 hooks (lower priority)
5. **Ongoing**: Monitor and optimize

## ⚠️ Important Notes

- **Don't migrate everything at once** - Do it gradually
- **Test each migration** before moving to the next
- **Keep fallback logic** (like in `useProgramEntries`) for critical operations
- **Stripe operations** (`usePaymentPlan`) may need special handling
- **File uploads** may need different queue strategy

## 📚 Resources

- Migration Guide: `src/lib/mutation-queue/MIGRATION.md`
- API Documentation: `src/lib/mutation-queue/README.md`
- Example: `src/hooks/useProgramEntries.ts`

## 🎯 Recommended Starting Point

**Start with `useDailyCheckins.ts`** because:
1. It's high-traffic (daily use)
2. Users expect it to work offline
3. It's a simple mutation (insert/upsert)
4. Good test case for the system

Would you like me to migrate `useDailyCheckins.ts` as the next example?

