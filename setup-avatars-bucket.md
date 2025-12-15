# Quick Setup: Avatars Storage Bucket

## The Issue
The image upload is failing because the `avatars` storage bucket doesn't exist in your Supabase project.

## Quick Fix (Current Implementation)
The code now uses a **data URL approach** (base64) that works immediately without any setup. Images are stored as base64 strings in the database.

## For Better Performance (Optional)
To use Supabase Storage instead of base64, follow these steps:

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Fill in:
   - **Name**: `avatars`
   - **Public bucket**: ✅ (checked)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`

### Step 2: Set Up RLS Policies
1. Go to **Authentication** → **Policies**
2. Find the `avatars` bucket
3. Add these policies:

**Policy 1: Users can upload their own avatars**
```sql
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Users can update their own avatars**
```sql
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Users can delete their own avatars**
```sql
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Avatar images are publicly viewable**
```sql
CREATE POLICY "Avatar images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Step 3: Update Code (Optional)
Once the bucket is set up, you can uncomment the storage upload code in `ProfileHeader.tsx` and comment out the data URL approach.

## Current Status
✅ **Image upload works immediately** with data URL approach
✅ **No setup required** for basic functionality
✅ **File validation** (type and size)
✅ **User feedback** and loading states

The image upload feature is fully functional right now!
