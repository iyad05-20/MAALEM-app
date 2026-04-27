# Backend - Maalem App

This directory contains backend configuration, serverless API functions, and database rules for the Maalem-app platform.

## Directory Structure

```
backend/
├── api/                    # Vercel serverless functions
│   ├── generate-image.ts  # AI image generation (Cloudflare + Gemini)
│   ├── chat.ts            # Chatbot API (Google Gemini)
│   └── analyze-urgent.ts  # Urgent order analysis
├── firebase/
│   ├── rules/
│   │   └── firestore.rules  # Firestore security rules
│   └── config.ts          # Firebase configuration (in frontend/src/services)
├── config/
│   └── supabase.ts        # Supabase configuration (in frontend/src/services)
└── migrations/            # Database migrations and schema
```

## API Routes

These are **Vercel Edge Functions** deployed with the frontend. They handle server-side operations that require API keys.

### `/api/chat`
- **Purpose**: Forward chat messages to Google Gemini API
- **Method**: POST
- **Environment**: `GEMINI_API_KEY`
- **Request Body**: `{ messages, systemInstruction }`
- **Response**: JSON-parsed Gemini response with safety checks and quota resilience

### `/api/generate-image`
- **Purpose**: Generate images using Cloudflare AI (Flux models)
- **Method**: POST
- **Environment**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
- **Models**: 
  - `flux-1-schnell`: Fast image generation (JSON payload)
  - `flux-2-dev`: Advanced generation with image input (multipart form data)

### `/api/analyze-urgent`
- **Purpose**: Analyze urgent orders
- **Method**: POST
- **Details**: See implementation for specific logic

## Firestore Rules

Security rules are in `firebase/rules/firestore.rules`.

**Current Status**: ⚠️ **PERMISSIVE** (development only)
```firestore
allow read, write: if true;
```

**Before Production**: Implement proper Row-Level Security (RLS) policies. See `docs/database/supabase_rls_policies.sql` for Supabase RLS examples.

## Database Configuration

### Firebase
- **Auth**: Used for user authentication
- **Firestore**: Main database for users, orders, artisans, chats
- **Configuration**: `frontend/src/services/firebase.config.ts`
- **RLS**: See firestore.rules (needs hardening for production)

### Supabase
- **Storage**: User profile pictures (bucket: `vork-profilepic-bucket`)
- **RLS Policies**: See `docs/database/supabase_rls_policies.sql`
- **Configuration**: `frontend/src/services/supabase.config.ts`

## Environment Variables (Backend)

These are set in the frontend `.env` but used by backend API routes:

```env
# Cloudflare AI (Image Generation)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Google Gemini (Chatbot)
GEMINI_API_KEY=your_gemini_key

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Development

To test API endpoints locally during frontend development:

```bash
cd frontend
npm run dev
```

API routes are available at `http://localhost:3000/api/*`

## Deployment

### Vercel Deployment
1. API routes are automatically deployed with the frontend to Vercel
2. Set environment variables in Vercel project settings
3. No additional backend deployment needed

### Environment Setup
- Ensure all backend API environment variables are configured in Vercel
- Test API endpoints after deployment

## Security Notes

1. **API Keys**: Keep all keys in `.env` files, never commit them
2. **Firestore Rules**: Current rules allow all access - **must be restricted before production**
3. **CORS**: Verify CORS policies for API endpoints
4. **Rate Limiting**: Consider adding rate limiting for image generation and chat APIs (both have quotas)
5. **Input Validation**: All API routes validate required fields before processing

## Related Documentation

- **Setup Instructions**: See `/docs/SETUP.md`
- **Database Architecture**: See `/docs/database/README.md`
- **RLS Policies**: See `/docs/database/supabase_rls_policies.sql`
- **Firestore Rules**: See `firebase/rules/firestore.rules`
