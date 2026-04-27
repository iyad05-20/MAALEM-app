# Supabase RLS Policies

This file contains Row-Level Security (RLS) policies for Supabase PostgreSQL storage.

## Location

**Original**: `supabase_rls_fix.sql` (at root)  
**New Location**: `docs/database/supabase_rls_policies.sql`

## Purpose

These policies control access to user files (profile pictures) stored in Supabase Storage.

**Bucket**: `vork-profilepic-bucket`

## Policies

### 1. Public Read Access (SELECT)

```sql
CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING (bucket_id = 'vork-profilepic-bucket');
```

**Effect**: Anyone can view (download) profile pictures in the bucket.

### 2. Public Upload Access (INSERT)

```sql
CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vork-profilepic-bucket');
```

**Effect**: Authenticated users (from Firebase Auth) can upload profile pictures.

### 3. Update Access (UPDATE)

```sql
CREATE POLICY "Public Access Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vork-profilepic-bucket');
```

**Effect**: Users can overwrite files when "upsert" is enabled.

### 4. Delete Access (DELETE)

```sql
CREATE POLICY "Public Access Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'vork-profilepic-bucket');
```

**Effect**: Users can delete their own profile pictures (optional).

## How to Apply

### In Supabase Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Copy the full content from `supabase_rls_policies.sql`
3. Paste into SQL Editor
4. Click "Run"

### In Code (Supabase CLI)

```bash
supabase db push
```

## Security Notes

⚠️ **Current Policies Are Permissive**

- **Public read**: Anyone can view all profile pictures
- **Public upload**: Any authenticated user can upload to the bucket
- **No ownership check**: Users can update/delete other users' files

### Before Production

Consider more restrictive policies:

```sql
-- Only allow users to manage their own files
CREATE POLICY "User can upload own profile pic"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vork-profilepic-bucket'
  AND auth.uid() = owner_id  -- Requires owner_id column
);

CREATE POLICY "User can delete own profile pic"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vork-profilepic-bucket'
  AND auth.uid() = owner_id
);
```

## Environment

These policies are for the storage layer only.

**Configuration**: `frontend/src/services/supabase.config.ts`

```typescript
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

## Related Files

- **Backend**: [backend/README.md](../../backend/README.md)
- **Database Docs**: [docs/database/README.md](README.md)
- **Setup Guide**: [docs/SETUP.md](../SETUP.md)
