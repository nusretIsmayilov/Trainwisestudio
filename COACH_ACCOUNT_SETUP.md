# How to Create a Coach Account

## Current System Behavior

- **All new users** are automatically created with `role='customer'` by default
- There is **no UI** in the application to change from customer to coach
- Role is stored in `profiles.role` and automatically synced to `user_roles` table via triggers

## Methods to Create a Coach Account

### Method 1: Direct SQL Update (Quickest)

Run this in Supabase SQL Editor:

```sql
-- By email
UPDATE public.profiles 
SET role = 'coach' 
WHERE email = 'coach@example.com';

-- Or by user ID
UPDATE public.profiles 
SET role = 'coach' 
WHERE id = 'user-uuid-here';
```

**Note:** The trigger `on_profile_role_change` will automatically sync this to the `user_roles` table.

### Method 2: Using the RPC Function (After Migration)

After running the migration `20251125000000_add_become_coach_function.sql`:

**Option A: User becomes their own coach**
```sql
-- User calls this themselves (they must be authenticated)
SELECT public.become_coach();
```

**Option B: Admin assigns coach role**
```sql
-- Admin or authenticated user can assign coach role to any user
SELECT public.assign_coach_role('target-user-uuid-here');
```

### Method 3: Via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find the user you want to make a coach
3. Edit the row and change `role` from `'customer'` to `'coach'`
4. Save

### Method 4: Programmatically (Frontend/Backend)

If you want to add a UI button, you can call the RPC function:

```typescript
// In your React component or API
const { data, error } = await supabase.rpc('become_coach');
```

Or update directly (if RLS allows):
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ role: 'coach' })
  .eq('id', userId);
```

## Verification

After changing the role, verify it worked:

```sql
-- Check profile
SELECT id, email, role FROM public.profiles WHERE email = 'coach@example.com';

-- Check user_roles (should be synced automatically)
SELECT * FROM public.user_roles WHERE user_id = 'user-uuid-here';
```

## What Happens After Role Change

1. User's `profiles.role` is updated to `'coach'`
2. Trigger automatically syncs to `user_roles` table
3. User will be redirected to `/coach/dashboard` on next login
4. User gains access to all coach routes:
   - `/coach/dashboard`
   - `/coach/settings`
   - `/coach/clients`
   - `/coach/programs`
   - etc.

## Security Considerations

- The `become_coach()` function allows any authenticated user to become a coach
- If you want to restrict this, you can:
  1. Remove the public grant and only allow admins
  2. Add approval workflow
  3. Add validation checks (e.g., require profile completion first)

## Recommended Approach

For **development/testing**: Use Method 1 (direct SQL)

For **production**: 
- Option A: Use Method 2 with admin-only restrictions
- Option B: Create a proper UI with admin approval workflow
- Option C: Use Supabase Dashboard for manual assignment


