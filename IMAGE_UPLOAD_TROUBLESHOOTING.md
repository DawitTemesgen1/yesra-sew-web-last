# 🔧 Blog Image Upload Troubleshooting Guide

## Issue: Images Not Uploading

### Quick Fix Steps:

1. **Run the Complete Setup SQL**
   ```
   File: supabase_migrations/complete_blog_setup.sql
   ```
   This creates:
   - ✅ Storage bucket `public-assets`
   - ✅ Storage RLS policies
   - ✅ All blog tables
   - ✅ Proper permissions

2. **Verify Storage Bucket Exists**
   - Go to Supabase Dashboard → **Storage**
   - Check if `public-assets` bucket exists
   - Verify it's marked as **Public**

3. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try uploading an image
   - Look for error messages

---

## Common Errors & Solutions

### Error: "Bucket not found"
**Solution**: Run `complete_blog_setup.sql` to create the bucket

### Error: "Permission denied"
**Solution**: 
1. Check you're logged in as admin
2. Verify storage policies exist
3. Run the complete setup SQL

### Error: "File too large"
**Solution**:
- Featured images: Max 5MB
- Avatars: Max 2MB
- Compress images before uploading

### Error: "Invalid file type"
**Solution**: Only upload image files (JPG, PNG, GIF, WebP)

---

## Manual Bucket Creation (Alternative)

If SQL doesn't work, create bucket manually:

1. Go to **Supabase Dashboard**
2. Click **Storage** in sidebar
3. Click **New Bucket**
4. Settings:
   - **Name**: `public-assets`
   - **Public**: Toggle ON
   - **File size limit**: 5242880 (5MB)
   - **Allowed MIME types**: 
     - image/jpeg
     - image/png
     - image/gif
     - image/webp
5. Click **Create**

---

## Verify Setup Checklist

### Storage:
- [ ] Bucket `public-assets` exists
- [ ] Bucket is marked as Public
- [ ] File size limit is 5MB
- [ ] Allowed MIME types include images

### Policies:
- [ ] "Anyone can view public assets" (SELECT)
- [ ] "Admins can upload to public-assets" (INSERT)
- [ ] "Admins can update public-assets" (UPDATE)
- [ ] "Admins can delete from public-assets" (DELETE)

### Tables:
- [ ] `blog_posts` table exists
- [ ] `additional_images` column exists
- [ ] RLS is enabled
- [ ] Admin policies exist

---

## Test Upload Flow

1. **Login as Admin**
2. **Go to Blog Management** (menu #32)
3. **Click "Create New Post"**
4. **Go to Settings Tab**
5. **Click "Upload Image"**
6. **Select an image file**
7. **Watch for**:
   - Upload progress
   - Success message
   - Image preview appears

---

## Debug Upload Function

Check browser console for these logs:

```javascript
// Success
"Image uploaded successfully!"

// Error examples
"Failed to upload image: Bucket not found"
"Failed to upload image: Permission denied"
"Failed to upload image: File too large"
```

---

## Storage Folder Structure

After successful upload, you should see:

```
public-assets/
  ├── blog-images/
  │   ├── {timestamp}-{random}.jpg
  │   └── additional/
  │       └── {timestamp}-{random}.jpg
  └── avatars/
      └── {timestamp}-{random}.jpg
```

---

## Quick Test

### Test Featured Image Upload:
1. Create new post
2. Go to Settings tab
3. Click "Upload Image"
4. Select image < 5MB
5. Should see preview immediately

### Test Avatar Upload:
1. Same post
2. Scroll to "Author Avatar"
3. Click "Upload Avatar"
4. Select image < 2MB
5. Should see circular preview

### Test Multiple Images:
1. Same post
2. Scroll to "Additional Images"
3. Click "Upload Additional Images"
4. Select multiple images (Ctrl/Cmd + Click)
5. Should see grid of thumbnails

---

## Still Not Working?

### Check These:

1. **Are you logged in?**
   - Must be authenticated
   - Must have admin role

2. **Is Supabase URL correct?**
   - Check `.env` file
   - Verify `REACT_APP_SUPABASE_URL`
   - Verify `REACT_APP_SUPABASE_ANON_KEY`

3. **Network issues?**
   - Check internet connection
   - Check Supabase status page
   - Try different network

4. **Browser cache?**
   - Clear browser cache
   - Try incognito mode
   - Try different browser

---

## Get Detailed Error Info

Add this to your upload handler temporarily:

```javascript
try {
    // upload code
} catch (err) {
    console.error('Full error:', err);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error details:', err.details);
}
```

---

## Contact Support

If still having issues, provide:
1. Error message from console
2. Screenshot of Storage page
3. Screenshot of upload attempt
4. Browser and version

---

## Success Indicators

You know it's working when:
- ✅ Upload button shows progress
- ✅ Success message appears
- ✅ Image preview shows immediately
- ✅ Image URL is populated in form
- ✅ Image appears in card grid after saving
- ✅ Files visible in Supabase Storage dashboard

---

## Final Check

Run this SQL to verify everything:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'public-assets';

-- Check policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check blog_posts table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'blog_posts';
```

Should return:
- 1 bucket row
- 4 policy rows
- Column list including `additional_images`

---

**Run `complete_blog_setup.sql` and you should be good to go!** 🚀
