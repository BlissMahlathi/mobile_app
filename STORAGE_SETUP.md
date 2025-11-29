# Supabase Storage Setup for Profile Photos

## Steps to Enable Profile Photo Uploads

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Check this (so photos are publicly accessible)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/*`

### 2. Set Storage Policies

Go to **Storage** > **Policies** and add these policies:

#### Allow Users to Upload Their Own Avatars
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Allow Public Read Access
```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Allow Users to Update Their Own Avatars
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Allow Users to Delete Their Own Avatars
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Update Database Schema

Run this SQL in your Supabase SQL Editor to add the `avatar_url` column if it doesn't exist:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### 4. Test the Setup

1. Open your app
2. Navigate to Profile screen
3. Tap on the profile picture
4. Select a photo from your device
5. The photo should upload and display

## Troubleshooting

### Upload Fails
- Check that the bucket is public
- Verify storage policies are set correctly
- Check browser console for specific errors

### Photo Doesn't Display
- Verify the bucket is set to public
- Check that the public URL is correctly generated
- Ensure the `avatar_url` column exists in the users table

### Permission Errors
- Make sure you're authenticated
- Verify the storage policies allow authenticated users to upload
- Check that RLS is enabled on the storage.objects table

## File Structure

Photos are stored with this pattern:
```
avatars/
  └── {user_id}_{timestamp}.{extension}
```

This ensures:
- Each user can only access their own photos
- Photos are uniquely named
- Old photos can be overwritten with `upsert: true`
