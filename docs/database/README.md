# Database Documentation

This directory contains database configuration, RLS policies, and migration scripts for Maalem-app.

## Overview

The project uses two main databases:

- **Firebase Firestore**: Primary database for application data
- **Supabase PostgreSQL**: File storage and supplementary services

## Firestore (Firebase)

### Configuration
- Project: Maalem-app
- Region: Default (check Firebase console)
- Auth: Firebase Authentication

### Collections & Data Models

**Users Collection**
- Client profiles (with location, preferences)
- Artisan profiles (with skills, portfolio, ratings)
- Authentication via Firebase Auth

**Orders Collection**
- Order requests from clients
- Status tracking (created, accepted, in-progress, completed, archived)
- Associated with client and artisan

**Services/Categories Collection**
- Service types (plumbing, carpentry, electrical, etc.)
- Category metadata

**Chats Collection**
- Real-time messaging between clients and artisans
- Organized by participants

**Reviews Collection**
- Ratings and feedback from completed orders
- Photos and detailed reviews

### Security Rules

**Current Status**: ⚠️ **PERMISSIVE** (development)

Location: `backend/firebase/rules/firestore.rules`

```firestore
allow read, write: if true;
```

**Before production**, implement proper rules:
```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /orders/{orderId} {
  allow read: if request.auth.uid in resource.data.participants;
  allow write: if request.auth.uid == resource.data.clientId;
}
```

### Backup & Recovery

Firestore provides automatic daily backups. Access via Firebase Console > Data > Backups.

## Supabase (PostgreSQL)

### Storage Configuration
- Bucket: `vork-profilepic-bucket`
- Purpose: User profile pictures
- Access: Authenticated users

### RLS Policies

**Location**: `supabase_rls_policies.sql`

Current policies allow:
- **SELECT**: Public read access (anyone can view images)
- **INSERT**: Public upload (authenticated users can upload)
- **UPDATE**: Public update (upsert enabled)
- **DELETE**: Public delete (optional, can be removed)

```sql
CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING (bucket_id = 'vork-profilepic-bucket');
```

These policies should be reviewed before production deployment.

### Connection

**Configuration**: `frontend/src/services/supabase.config.ts`

```typescript
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

## Migrations

Migration scripts should be placed in this directory for:
1. Schema changes
2. Data migrations
3. Index creation

**Naming convention**: `YYYYMMDD_description.sql`

Example: `20260424_add_ratings_table.sql`

### Running Migrations

**Firebase (Firestore)**
- Manual via console or Firebase Admin SDK
- Use emulator for testing: `firebase emulators:start`

**Supabase (PostgreSQL)**
```bash
supabase migration new migration_name
supabase migration up
```

## Data Models Reference

### User Schema (Firestore)
```typescript
interface User {
  id: string;
  email: string;
  role: 'client' | 'artisan';
  profile: {
    fullName: string;
    phone: string;
    avatar?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Order Schema (Firestore)
```typescript
interface Order {
  id: string;
  clientId: string;
  artisanId?: string;
  categoryId: string;
  title: string;
  description: string;
  budget?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Backup Strategy

### Firebase
- Automatic daily backups (enabled by default)
- Export data: Firebase Console > Data > Export Collection

### Supabase
- Automated backups every 24 hours
- Manual backup: Dashboard > Database > Backups

## Performance Optimization

### Firestore
- Create indexes for frequently queried fields
- Use pagination for large result sets
- Monitor query performance in Firebase Console

### Supabase
- Index important columns
- Use connection pooling for high-traffic scenarios
- Monitor query performance in Dashboard

## Related Files

- **Firestore Rules**: `backend/firebase/rules/firestore.rules`
- **Supabase RLS**: `supabase_rls_policies.sql`
- **Backend Config**: `backend/README.md`
- **Setup Guide**: `docs/SETUP.md`
