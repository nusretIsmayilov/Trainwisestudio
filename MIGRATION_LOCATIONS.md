# Migration Locations Guide

This document shows **exactly where** to make changes in each hook file.

## 📍 File-by-File Migration Guide

### 1. ✅ `src/hooks/useProgramEntries.ts` - ALREADY MIGRATED
**Status:** ✅ Complete (use as reference)

---

### 2. 🔄 `src/hooks/useDailyCheckins.ts` - HIGH PRIORITY

**File Location:** `src/hooks/useDailyCheckins.ts`

**Changes Needed:**

#### Step 1: Add imports (after line 4)
```typescript
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';
```

#### Step 2: Add queue hook (after line 18)
```typescript
const { upsert: queueUpsert, isOnline } = useTableMutations('daily_checkins');
```

#### Step 3: Replace mutation (lines 45-68)
**FIND THIS:**
```typescript
const upsertToday = async (payload: {
  water_liters?: number | null;
  mood?: number | null;
  energy?: number | null;
  sleep_hours?: number | null;
}) => {
  if (!user) throw new Error('Not authenticated');
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: user.id,
      date: today,
      ...payload,
    }, { onConflict: 'user_id,date' })
    .select('*');
  if (error) throw error;
  await fetchCheckins();
  
  // Use smart refresh to update all related data
  await refreshAll();
  
  return data as DailyCheckinRecord[];
};
```

**REPLACE WITH:**
```typescript
const upsertToday = async (payload: {
  water_liters?: number | null;
  mood?: number | null;
  energy?: number | null;
  sleep_hours?: number | null;
}) => {
  if (!user) throw new Error('Not authenticated');
  const today = new Date().toISOString().slice(0, 10);
  
  // Use mutation queue for offline support and scalability
  try {
    await queueUpsert(
      {
        user_id: user.id,
        date: today,
        ...payload,
      },
      'user_id,date',
      {
        invalidateQueries: [queryKeys.dailyCheckins(user.id, today)],
      }
    );
    
    // If online, fetch immediately; otherwise queue will handle it
    if (isOnline) {
      await fetchCheckins();
      await refreshAll();
    }
    
    // Return optimistic data
    return [{
      id: `temp_${Date.now()}`,
      user_id: user.id,
      date: today,
      ...payload,
    }] as DailyCheckinRecord[];
  } catch (error) {
    // Fallback to direct Supabase call if queue fails
    const { data, error: supabaseError } = await supabase
      .from('daily_checkins')
      .upsert({
        user_id: user.id,
        date: today,
        ...payload,
      }, { onConflict: 'user_id,date' })
      .select('*');
    if (supabaseError) throw supabaseError;
    await fetchCheckins();
    await refreshAll();
    return data as DailyCheckinRecord[];
  }
};
```

**Note:** You'll also need to add `dailyCheckins` to `queryKeys` in `src/lib/query-config.ts`:
```typescript
dailyCheckins: (userId?: string, date?: string) => 
  ['daily-checkins', userId, date] as const,
```

---

### 3. 🔄 `src/hooks/useProfileUpdates.ts` - HIGH PRIORITY

**File Location:** `src/hooks/useProfileUpdates.ts`

**Changes Needed:**

#### Step 1: Add imports (after line 3)
```typescript
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';
```

#### Step 2: Add queue hooks (after line 28)
```typescript
const { update: queueUpdate, upsert: queueUpsert } = useTableMutations('profiles');
const { upsert: queueOnboardingUpsert } = useTableMutations('onboarding_details');
```

#### Step 3: Replace `updateProfile` mutation (lines 31-76)
**FIND THIS:**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: payload.full_name,
    phone: payload.phone,
    avatar_url: payload.avatar_url,
  })
  .eq('id', user.id);
```

**REPLACE WITH:**
```typescript
try {
  await queueUpdate(
    {
      full_name: payload.full_name,
      phone: payload.phone,
      avatar_url: payload.avatar_url,
    },
    { id: user.id },
    {
      invalidateQueries: [queryKeys.profile(user.id)],
    }
  );
  await refreshProfile();
  return true;
} catch (error) {
  // Fallback to direct Supabase call
  const { error: supabaseError } = await supabase
    .from('profiles')
    .update({
      full_name: payload.full_name,
      phone: payload.phone,
      avatar_url: payload.avatar_url,
    })
    .eq('id', user.id);
  if (supabaseError) throw supabaseError;
  await refreshProfile();
  return true;
}
```

#### Step 4: Replace `updateOnboarding` mutation (lines 98-116)
**FIND THIS:**
```typescript
const { data, error } = await supabase
  .from('onboarding_details')
  .upsert({
    user_id: user.id,
    goals: payload.goals,
    location: payload.location,
    // ... rest of payload
  }, { onConflict: 'user_id' })
  .select('*')
  .single();
```

**REPLACE WITH:**
```typescript
try {
  await queueOnboardingUpsert(
    {
      user_id: user.id,
      goals: payload.goals,
      location: payload.location,
      weight: payload.weight,
      height: payload.height,
      gender: payload.gender,
      dob: payload.dob,
      country: payload.country,
      allergies: payload.allergies,
      training_likes: payload.training_likes,
      training_dislikes: payload.training_dislikes,
      injuries: payload.injuries,
      meditation_experience: payload.meditation_experience,
    },
    'user_id',
    {
      invalidateQueries: [queryKeys.profile(user.id)],
    }
  );
  
  // Return optimistic data
  return {
    user_id: user.id,
    ...payload,
  } as any;
} catch (error) {
  // Fallback to direct Supabase call
  const { data, error: supabaseError } = await supabase
    .from('onboarding_details')
    .upsert({
      user_id: user.id,
      goals: payload.goals,
      location: payload.location,
      weight: payload.weight,
      height: payload.height,
      gender: payload.gender,
      dob: payload.dob,
      country: payload.country,
      allergies: payload.allergies,
      training_likes: payload.training_likes,
      training_dislikes: payload.training_dislikes,
      injuries: payload.injuries,
      meditation_experience: payload.meditation_experience,
    }, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (supabaseError) throw supabaseError;
  return data;
}
```

---

### 4. 🔄 `src/hooks/useProgramMutations.ts` - HIGH PRIORITY

**File Location:** `src/hooks/useProgramMutations.ts`

**Changes Needed:**

#### Step 1: Add imports (after line 4)
```typescript
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';
```

#### Step 2: Add queue hooks (after line 26)
```typescript
const { insert: queueInsert, update: queueUpdate, remove: queueDelete } = useTableMutations('programs');
const { insert: queueMessageInsert } = useTableMutations('messages');
const { insert: queueConversationInsert } = useTableMutations('conversations');
```

#### Step 3: Replace `createProgram` mutation (lines 56-69)
**FIND THIS:**
```typescript
const { data: result, error } = await supabase
  .from('programs')
  .insert({
    name: data.name,
    description: data.description,
    category: data.category,
    status: data.status || 'draft',
    coach_id: profile.id,
    assigned_to: data.assignedTo || null,
    scheduled_date: data.scheduledDate || null,
    plan: data.plan || null,
  })
  .select()
  .single();
```

**REPLACE WITH:**
```typescript
try {
  await queueInsert(
    {
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status || 'draft',
      coach_id: profile.id,
      assigned_to: data.assignedTo || null,
      scheduled_date: data.scheduledDate || null,
      plan: data.plan || null,
    },
    {
      invalidateQueries: [
        queryKeys.programs(),
        queryKeys.coachPrograms(profile.id),
      ],
    }
  );
  
  // Return optimistic data
  const result = {
    id: `temp_${Date.now()}`,
    name: data.name,
    description: data.description,
    category: data.category,
    status: data.status || 'draft',
    coach_id: profile.id,
    assigned_to: data.assignedTo || null,
    scheduled_date: data.scheduledDate || null,
    plan: data.plan || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Handle message creation (keep existing logic but use queue)
  if (result.assigned_to) {
    // ... existing conversation/message logic but use queueInsert
  }
  
  return result as Program;
} catch (error) {
  // Fallback to direct Supabase call
  const { data: result, error: supabaseError } = await supabase
    .from('programs')
    .insert({
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status || 'draft',
      coach_id: profile.id,
      assigned_to: data.assignedTo || null,
      scheduled_date: data.scheduledDate || null,
      plan: data.plan || null,
    })
    .select()
    .single();
  if (supabaseError) throw supabaseError;
  // ... rest of existing logic
}
```

#### Step 4: Replace `updateProgram` mutation (around line 159)
**FIND THIS:**
```typescript
const { data: result, error } = await supabase
  .from('programs')
  .update({
    name: data.name,
    description: data.description,
    // ... rest
  })
  .eq('id', data.id)
  .select()
  .single();
```

**REPLACE WITH:**
```typescript
try {
  await queueUpdate(
    {
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status,
      assigned_to: data.assignedTo,
      scheduled_date: data.scheduledDate,
      plan: data.plan,
    },
    { id: data.id },
    {
      invalidateQueries: [
        queryKeys.program(data.id),
        queryKeys.programs(),
        queryKeys.coachPrograms(profile.id),
      ],
    }
  );
  
  // Return optimistic data
  return {
    id: data.id,
    name: data.name,
    // ... rest of fields
  } as Program;
} catch (error) {
  // Fallback to direct Supabase call
  // ... existing code
}
```

#### Step 5: Replace `deleteProgram` mutation (around line 211)
**FIND THIS:**
```typescript
const { error } = await supabase
  .from('programs')
  .delete()
  .eq('id', id)
  .eq('coach_id', profile.id);
```

**REPLACE WITH:**
```typescript
try {
  await queueDelete(
    { id, coach_id: profile.id },
    {
      invalidateQueries: [
        queryKeys.program(id),
        queryKeys.programs(),
        queryKeys.coachPrograms(profile.id),
      ],
    }
  );
  return true;
} catch (error) {
  // Fallback to direct Supabase call
  const { error: supabaseError } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
    .eq('coach_id', profile.id);
  if (supabaseError) throw supabaseError;
  return true;
}
```

---

## 📋 Quick Reference: All Files to Migrate

### High Priority (Do First)
1. ✅ `src/hooks/useProgramEntries.ts` - **DONE**
2. 🔄 `src/hooks/useDailyCheckins.ts` - **Line 45-68**
3. 🔄 `src/hooks/useProfileUpdates.ts` - **Lines 51-58, 98-116**
4. 🔄 `src/hooks/useProgramMutations.ts` - **Lines 56-69, 159-168, 211-214**

### Medium Priority
5. `src/hooks/useWeightTracking.ts` - Find `.upsert(` or `.insert(`
6. `src/hooks/useMessages.ts` - Find `.insert(` for messages
7. `src/hooks/useCoachLibrary.ts` - Find `.upsert(` and `.delete(`
8. `src/hooks/useCoachBlog.ts` - Find `.insert(` and `.update(`

### Lower Priority
9. `src/hooks/useCoachRequests.ts`
10. `src/hooks/useOfferActions.ts`
11. `src/hooks/useConversations.ts`
12. `src/hooks/useProgressPhotos.ts`
13. `src/hooks/useRealTimeCheckIns.ts`
14. `src/hooks/useWelcomePDF.ts`
15. `src/hooks/useCoachProfile.ts`
16. `src/hooks/useEnhancedCoaches.ts`

---

## 🔍 How to Find Mutations in Any File

1. **Open the file** in your editor
2. **Search for:** `.insert(`, `.update(`, `.delete(`, `.upsert(`
3. **Look for patterns like:**
   ```typescript
   await supabase.from('table_name').insert/update/delete/upsert(...)
   ```
4. **Replace with queue methods** following the patterns above

---

## ✅ Checklist for Each Migration

- [ ] Add imports: `useTableMutations` and `queryKeys`
- [ ] Add queue hook: `const { insert/update/delete/upsert } = useTableMutations('table_name')`
- [ ] Replace Supabase mutation with queue method
- [ ] Add `invalidateQueries` with appropriate query keys
- [ ] Add fallback to direct Supabase call (for error handling)
- [ ] Test online behavior
- [ ] Test offline behavior
- [ ] Verify UI updates correctly

---

## 🎯 Start Here

**Recommended order:**
1. ✅ `useProgramEntries.ts` (already done - use as reference)
2. `useDailyCheckins.ts` (simplest - good starting point)
3. `useProfileUpdates.ts` (two mutations - good practice)
4. `useProgramMutations.ts` (more complex - multiple mutations)

Each migration should take 5-10 minutes once you get the pattern!

