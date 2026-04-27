# Architecture - Maalem App

High-level system design and component overview for Maalem-app.

## System Overview

Maalem-app is a **Progressive Web App (PWA) marketplace** connecting clients with artisans for home services.

**Tech Stack**:
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Firebase (Firestore + Auth) + Supabase (Storage)
- **APIs**: Google Gemini (AI/Chatbot) + Cloudflare AI (Image Generation)
- **Deployment**: Vercel (frontend + serverless functions)

```
┌─────────────────────────────────────────────────────────────┐
│                     MAALEM-APP SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React/Vite PWA)              │  │
│  │  • Client-facing marketplace interface              │  │
│  │  • Artisan profile & portfolio views                │  │
│  │  • Real-time chat messaging                         │  │
│  │  • Order management & tracking                      │  │
│  │  • Offline support & auto-caching                   │  │
│  └─────────────┬──────────────────────────────────────┘  │
│                │ HTTPS                                    │
│  ┌─────────────▼──────────────────────────────────────┐  │
│  │         VERCEL SERVERLESS FUNCTIONS                │  │
│  │  • /api/chat (Gemini chatbot)                      │  │
│  │  • /api/generate-image (Cloudflare AI)             │  │
│  │  • /api/analyze-urgent (order analysis)            │  │
│  └─────────────┬──────────────────────────────────────┘  │
│                │                                          │
│   ┌────────────┼───────────────┬───────────────┐          │
│   │            │               │               │          │
│  ┌▼─────┐ ┌───▼────┐ ┌────────▼─┐ ┌─────────▼┐          │
│  │Google│ │Firebase│ │ Supabase │ │Cloudflare│          │
│  │Gemini│ │Firestore│ │PostgreSQL│ │    AI    │          │
│  └──────┘ └─────────┘ └──────────┘ └──────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── components/              # UI Components (organized by type)
│   │   ├── ui/                 # Basic UI components (buttons, inputs)
│   │   ├── form/               # Form-specific components
│   │   ├── chat/               # Chat-related components
│   │   ├── layout/             # Layout wrappers
│   │   ├── Navigation/         # Navigation components (Navbar, Header)
│   │   ├── Shared/             # Shared utilities (Avatar, CategoryIcon)
│   │   └── common/             # Common components (ErrorBoundary, Toast)
│   │
│   ├── views/                   # Page-level screens (route containers)
│   │   ├── auth/               # Login, Register, Verify Email
│   │   ├── client/             # Client-specific screens
│   │   ├── artisan/            # Artisan-specific screens
│   │   └── common/             # Shared screens (OfflineView, etc)
│   │
│   ├── services/               # API clients & configuration
│   │   ├── firebase.config.ts  # Firebase initialization
│   │   ├── supabase.config.ts  # Supabase initialization
│   │   ├── auth.service.ts     # Authentication logic
│   │   ├── order.service.ts    # Order operations
│   │   ├── location.service.ts # Geolocation & distance
│   │   ├── ai/                 # AI integrations
│   │   │   ├── geminiService.ts    # Gemini chatbot
│   │   │   └── imageGenService.ts  # Image generation
│   │   └── recommendation.service.ts # Recommendations
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAppLogic.ts      # Main app orchestration
│   │   ├── useAuthLogic.ts     # Authentication flow
│   │   ├── useChatsLogic.ts    # Chat management
│   │   ├── useOrdersLogic.ts   # Order management
│   │   └── ...
│   │
│   ├── context/                # React Context (State Management)
│   │   └── AuthContext.tsx     # Authentication state & provider
│   │
│   ├── types/                   # TypeScript interfaces
│   │   └── index.ts            # Shared type definitions
│   │
│   ├── utils/                   # Utility functions
│   │   └── index.ts            # Helper functions
│   │
│   ├── data/                    # Mock data & constants
│   │   └── mockData.ts         # Categories, sample data
│   │
│   ├── styles/                  # Global styles
│   │   └── index.css           # Global CSS + Tailwind imports
│   │
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── api/                         # Vercel serverless functions
│   ├── chat.ts                 # Gemini chatbot endpoint
│   ├── generate-image.ts       # Image generation endpoint
│   └── analyze-urgent.ts       # Urgent order analysis
│
├── public/                      # Static assets
│   ├── icons/                  # PWA icons (72px - 512px)
│   └── screenshots/            # App screenshots
│
└── vite.config.ts              # Vite + PWA plugin config
```

### State Management

**Primary**: React Context (`AuthContext`)
- Stores: User auth state, user profile, user role
- Provides: `useAuth()` hook for components

**Secondary**: Component State
- Uses React `useState` for local component state
- Props drilling for inter-component communication

**Data Flows**:
```
AuthContext (root)
    ↓
App Component (decides view based on auth/role)
    ↓
Views (Page-level screens)
    ↓
Components (UI elements)
    ↓
Services (API calls)
```

### Component Organization

**UI Components** (`components/ui/`)
- Reusable, stateless elements
- Buttons, inputs, cards, modals
- No business logic

**Form Components** (`components/form/`)
- Form inputs and validators
- File uploads, photo pickers
- Form state handling

**Chat Components** (`components/chat/`)
- Chat bubbles, input fields
- Message display logic
- AI chatbot UI

**Layout Components** (`components/layout/`)
- Page wrappers, sidebars
- Navigation bars, footers
- Grid/flex layouts

**Shared Components** (`components/Shared/`)
- Avatar display (SmartAvatar)
- Category icons (CategoryIcon)
- Artisan cards (ArtisanCard)
- Reusable utilities

**Common Components** (`components/common/`)
- Error boundaries
- Toast notifications
- PWA install prompt
- Fallback screens

### Views (Page Containers)

**Auth Views** (`views/auth/`)
- `LoginView` - User login
- `RegisterClientView` - Client registration
- `RegisterArtisanView` - Artisan registration
- `VerifyEmailView` - Email verification
- `UpdateEmailView` - Email updates

**Client Views** (`views/client/`)
- `HomeView` - Browse services/artisans
- `SearchView` - Search & filter
- `ArtisanDetailView` - View artisan profile
- `CreateOrderView` - Create new order
- `OrdersView` - Order history
- `ChatListView` - All conversations
- `ChatDetailView` - Individual chat
- `SettingsView` - Profile settings
- `ProfileView` - User profile

**Artisan Views** (`views/artisan/`)
- `ArtisanDashboardView` - Overview stats
- `ArtisanProfileView` - Edit profile
- `MarketplaceView` - Available orders
- `ArtisanOrderDetailView` - Order details
- `ArtisanPublishView` - Publish portfolio
- `ArtisanStatsView` - Performance stats
- `ArtisanHistoryView` - Completed orders

### Lazy Loading

Main views are **code-split** using React.lazy():

```typescript
const LoginView = React.lazy(() => 
  import('./views/auth/LoginView')
    .then(m => ({ default: m.LoginView }))
);
```

Benefits:
- Smaller initial bundle
- Faster page load
- Code loaded on-demand

### PWA Features

**Service Worker** (via Vite PWA plugin):
- Auto-update detection
- Offline support
- Background sync

**Caching Strategies**:
```
ESM.sh (js libs)        → CacheFirst (30 days)
Firebase JS SDK         → CacheFirst (30 days)
Supabase Storage        → CacheFirst (30 days)
Google Fonts (CSS)      → StaleWhileRevalidate
Google Fonts (webfonts) → CacheFirst (1 year)
```

**Manifest**:
- Located: `vite.config.ts` PWA config
- Defines: App name, icons, theme colors
- Icons: Multiple sizes (72px - 512px) in `public/icons/`

**Offline Views**:
- `OfflineView` component displays when no connection
- Data accessible from cache
- Queue operations for sync when online

## Backend Architecture

### Firestore (Firebase)

**Purpose**: Primary database for application data

**Collections**:
- `users/` - User profiles (client & artisan)
- `orders/` - Service requests
- `services/` - Service categories
- `chats/` - Real-time messages
- `reviews/` - Ratings & feedback
- `recommendations/` - ML recommendations

**Security**:
- ⚠️ **Currently permissive** (development mode)
- RLS needed before production
- Auth-based access control

**Firestore Rules**: `backend/firebase/rules/firestore.rules`

### Supabase (PostgreSQL)

**Purpose**: File storage for user avatars

**Buckets**:
- `vork-profilepic-bucket` - Profile pictures

**RLS Policies**: See `docs/database/supabase_rls_policies.sql`
- Allow public read (view avatars)
- Allow authenticated upload (own pictures)
- Allow update & delete (own files)

### API Routes (Vercel Functions)

**Deployment**: Automatically with frontend to Vercel

**Endpoints**:
1. `/api/chat` - Gemini chatbot
   - Takes: message history
   - Returns: AI response

2. `/api/generate-image` - Image generation
   - Takes: prompt, image model
   - Returns: Generated image (base64)

3. `/api/analyze-urgent` - Order analysis
   - Takes: order details
   - Returns: Analysis results

**Environment**:
- `GEMINI_API_KEY` - Google Gemini
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare AI
- `CLOUDFLARE_API_TOKEN` - Cloudflare AI

## Data Flow

### User Authentication Flow

```
1. User fills login form
2. LoginView calls useAuthLogic()
3. useAuthLogic calls auth.service.login()
4. auth.service calls Firebase Auth API
5. On success: AuthContext updates
6. App re-renders with new auth state
7. ViewSwitcher shows appropriate view based on role
```

### Order Creation Flow

```
1. Client fills CreateOrderView form
2. Clicks "Create Order"
3. Calls order.service.createOrder()
4. order.service validates data
5. Sends POST to Firestore (create document)
6. Optionally: Trigger /api/analyze-urgent
7. Triggers AI chatbot (/api/chat) if needed
8. Display success toast & redirect to orders
```

### Real-time Chat Flow

```
1. User opens chat with artisan
2. ChatDetailView subscribes to Firestore messages
3. New messages update in real-time (Firestore listener)
4. User types message & sends
5. Message added to Firestore collection
6. Both parties see it instantly (real-time sync)
```

## Deployment Architecture

### Vercel (Frontend + API)

```
Vercel Project
├── Source: GitHub repo (frontend/ directory)
├── Build: npm run build
├── Output: frontend/dist/
├── API Routes: frontend/api/* auto-deployed
├── Environment: .env vars configured in Vercel UI
└── CDN: Global edge caching
```

### Firebase

```
Firebase Project
├── Auth: Managed by Firebase
├── Firestore: Managed by Firebase
├── Security Rules: backend/firebase/rules/firestore.rules
└── Backups: Automatic daily
```

### Supabase

```
Supabase Project
├── PostgreSQL: Managed database
├── Storage: vork-profilepic-bucket
├── RLS: docs/database/supabase_rls_policies.sql
└── Backups: Automatic daily
```

## Vork (Separate Project)

**Status**: Separate Next.js 15 application

**Location**: `/vork` directory

**Framework**: Next.js 15 (not part of main monorepo)

**Build**: Independent
```bash
cd vork && npm run build
```

**Unclear Purpose**: 
- May be admin dashboard or experimental feature
- Needs clarification with team
- Consider separate repository if ongoing

---

## Performance Optimizations

1. **Code Splitting**: Lazy-loaded views
2. **PWA Caching**: Multi-level caching strategies
3. **Tree Shaking**: Unused code removed in build
4. **Image Optimization**: Responsive PWA icons
5. **Font Caching**: Google Fonts cached for 1 year

## Security Considerations

1. **API Keys**: Never committed, environment-only
2. **Auth**: Firebase Auth handles token management
3. **RLS**: Firestore rules need production hardening
4. **CORS**: Configured for Vercel domains
5. **Input Validation**: All API routes validate data
6. **Offline**: No sensitive data in local cache

## Related Documentation

- **Setup**: `docs/SETUP.md`
- **Database**: `docs/database/README.md`
- **Code Conventions**: `.github/copilot-instructions.md`
- **Backend**: `backend/README.md`
